<script lang="ts">
  import type { StrategyOption, FarmerPriorities, ClimateModifiers } from '../../types/game';
  import { STRATEGIES } from '../../data/mockData';
  import StickerCard from '../common/StickerCard.svelte';
  import Button from '../common/Button.svelte';
  import Slider from '../common/Slider.svelte';
  import RubberStamp from '../common/RubberStamp.svelte';
  import DataChip from '../common/DataChip.svelte';
  import MonteCarloRibbon from './MonteCarloRibbon.svelte';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';
  import { runSimulation } from '../../lib/simulation/index.js';
  import type { CropCatalog } from '../../../contracts/crops';
  import type { RegionalWeather } from '../../../contracts/weather';
  import cropsData from '../../lib/data/crops.json';
  import weatherPunjab from '../../lib/data/weather_punjab.json';
  import weatherKarnataka from '../../lib/data/weather_karnataka.json';
  import weatherIowa from '../../lib/data/weather_iowa.json';
  import weatherSahel from '../../lib/data/weather_sahel-kenya.json';

  interface Props {
    regionId?: string;
    onSelectStrategy?: (strategy: StrategyOption) => void;
    onBack?: () => void;
  }

  let { regionId = 'punjab', onSelectStrategy, onBack }: Props = $props();

  const weatherMap: Record<string, any> = {
    punjab: weatherPunjab,
    karnataka: weatherKarnataka,
    iowa: weatherIowa,
    sahel: weatherSahel
  };

  const currentRegionalWeather = $derived(
    (weatherMap[regionId] ?? weatherPunjab) as unknown as RegionalWeather
  );
  const catalog = cropsData as unknown as CropCatalog;

  const simOutputs = $derived.by(() => {
    try {
      const reg = regionId === 'karnataka' ? 'karnataka' : 'punjab';
      const existing = runSimulation('existing_rotation', currentRegionalWeather, { region: reg, cropCatalog: catalog });
      const resilience = runSimulation('resilience_rotation', currentRegionalWeather, { region: reg, cropCatalog: catalog });
      const income = runSimulation('income_rotation', currentRegionalWeather, { region: reg, cropCatalog: catalog });
      return {
        strategy_existing: existing.contractOutput,
        strategy_resilience: resilience.contractOutput,
        strategy_income: income.contractOutput
      };
    } catch (e) {
      console.warn('Simulation execution fallback:', e);
      return {} as Record<string, any>;
    }
  });

  // Farmer Priorities Sliders
  let priorities = $state<FarmerPriorities>({
    water: 75,
    income: 50,
    soilHealth: 80,
    labor: 40
  });

  // Climate What-If Modifiers
  let climate = $state<ClimateModifiers>({
    tempOffset: 1.5,
    rainOffset: -10
  });

  // Calculate dynamic ranking score based on priorities and climate stress
  function calculateScore(strat: StrategyOption, p: FarmerPriorities, c: ClimateModifiers): number {
    // Water conservation bonus (strat.metrics.waterStressDelta is negative for reduction)
    const waterScore = (-strat.metrics.waterStressDelta) * (p.water / 100);
    // Income bonus
    const incomeScore = strat.metrics.incomeReturn * (p.income / 100);
    // Soil health bonus
    const soilScore = strat.metrics.soilCarbonDelta * (p.soilHealth / 100);
    // Labor ease (penalize high extra labor if farmer prioritizes lower labor)
    const laborPenalty = (strat.metrics.laborReqDelta) * (p.labor / 100) * 0.4;
    
    // Climate penalty: higher temperature offsets hurt existing high-water crops more
    const climatePenalty = strat.id === 'strategy_existing' ? (c.tempOffset * 10 - c.rainOffset * 0.5) : (c.tempOffset * 2);

    return Math.round(50 + waterScore + incomeScore + soilScore - laborPenalty - climatePenalty);
  }

  // Live evaluated strategies with score
  const scoredStrategies = $derived(
    STRATEGIES.map(s => ({
      ...s,
      currentScore: calculateScore(s, priorities, climate)
    })).sort((a, b) => b.currentScore - a.currentScore)
  );

  const winningId = $derived(scoredStrategies[0]?.id);
</script>

<div class="compare-container">
  <!-- Screen Header -->
  <div class="compare-header">
    <div class="header-left">
      <h2 class="title font-display">Four Seasons Strategy Compare</h2>
      <p class="subtitle font-body">
        Three crop rotation paths for Amma's field. Adjust your farm priorities below to re-rank outcomes.
      </p>
    </div>
    <div class="header-right">
      <Button variant="secondary" size="sm" onclick={onBack}>← Return to Field</Button>
    </div>
  </div>

  <BlockPrintBorder height={14} />

  <!-- 3 Strategy Cards "Dealt" on the table -->
  <div class="cards-table">
    {#each scoredStrategies as strat, idx (strat.id)}
      {@const isWinner = strat.id === winningId}
      {@const tilt = idx === 0 ? -1 : idx === 1 ? 0.8 : -0.5}

      <div class="strategy-column {isWinner ? 'winner-card-wrap' : ''}">
        <!-- Winning Banner Ribbon -->
        {#if isWinner}
          <div class="winner-ribbon font-display" aria-live="polite">
            🏆 TOP RECOMMENDED MATCH ({strat.currentScore} PTS)
          </div>
        {/if}

        <StickerCard tilt={tilt} class="strategy-card">
          <!-- Card Header -->
          <div class="card-top">
            <span class="rotation-type-tag font-data">PATH 0{idx + 1}</span>
            <span class="score-badge font-data">Score: {strat.currentScore}</span>
          </div>

          <h3 class="strategy-title font-display">{strat.title}</h3>
          <div class="strategy-sub font-body">{strat.subtitle}</div>

          <!-- Crop Sequence Pills -->
          <div class="crop-rotation-flow">
            <div class="flow-label font-data">Rotation Cycle:</div>
            <div class="pills-row">
              {#each strat.cropRotation as crop}
                <span class="crop-pill font-body">{crop}</span>
              {/each}
            </div>
          </div>

          <!-- Why Suggested -->
          <div class="explanation-box">
            <p class="why-text font-body">{strat.whySuggested}</p>
          </div>

          <!-- NASA Simulation Engine Live Results (Member B & A Integration) -->
          {#if simOutputs[strat.id]}
            {@const sim = simOutputs[strat.id]}
            <div class="sim-metrics-box font-data">
              <div class="sim-metrics-title">🛰️ NASA POWER & Simulation Engine Metrics</div>
              <div class="sim-metrics-grid">
                <span title="Mass-balanced daily soil moisture fraction">💧 Moisture: {(sim.meters.soilMoisture * 100).toFixed(0)}%</span>
                <span title="Soil organic matter modeled dynamics">🌱 SOM: {sim.meters.organicMatter.toFixed(1)}%</span>
                <span title="Soil available nitrogen including BNF">🌿 Nitrogen: {sim.meters.nitrogen.toFixed(0)} kg/ha</span>
                <span title="USLE rainfall-crop cover erosion risk proxy">⛰️ Erosion: {sim.meters.erosionRisk.toFixed(2)}</span>
                <span title="Modeled net farm income index">💰 Income: ₹{sim.meters.income}</span>
                <span title="Total seasonal crop water demand">🌾 Water Use: {sim.meters.waterUse} mm</span>
              </div>
            </div>
          {/if}

          <!-- Monte Carlo Range Ribbon -->
          <MonteCarloRibbon 
            p10={simOutputs[strat.id]?.p10?.p10 ?? strat.monteCarlo.p10} 
            median={simOutputs[strat.id]?.p50?.p50 ?? strat.monteCarlo.median} 
            p90={simOutputs[strat.id]?.p90?.p90 ?? strat.monteCarlo.p90} 
          />

          <!-- Key NASA Satellite Evidence Chips -->
          <div class="evidence-section">
            <div class="section-label font-data">NASA Satellite Evidence:</div>
            <div class="chips-list">
              {#each strat.nasaEvidenceChips as chip}
                <DataChip note={chip} />
              {/each}
            </div>
          </div>

          <!-- Benefits & Risks -->
          <div class="bullet-grid">
            <div class="benefit-box">
              <span class="box-heading font-data">✓ Key Strengths</span>
              <ul>
                {#each strat.benefits as ben}
                  <li class="font-body">{ben}</li>
                {/each}
              </ul>
            </div>

            <div class="risk-box">
              <span class="box-heading font-data">⚠️ Vulnerabilities & Gaps</span>
              <ul>
                {#each strat.risks as risk}
                  <li class="font-body">{risk}</li>
                {/each}
                {#each strat.dataGaps as gap}
                  <li class="font-body data-gap">Data Gap: {gap}</li>
                {/each}
              </ul>
            </div>
          </div>

          <!-- Rubber Stamp if Expert Advice needed -->
          {#if strat.needsLocalExpert}
            <div class="stamp-container">
              <RubberStamp text="ASK A LOCAL EXPERT" subtext="Supports, doesn't replace farmers" angle={-5} />
            </div>
          {/if}

          <!-- Action Button -->
          <div class="card-footer-action">
            <Button 
              variant={isWinner ? 'paddy' : 'primary'} 
              size="md" 
              onclick={() => onSelectStrategy?.(strat)}
            >
              Adopt This Plan →
            </Button>
          </div>
        </StickerCard>
      </div>
    {/each}
  </div>

  <BlockPrintBorder height={14} />

  <!-- Control Panel: Farmer Priorities & Climate Sliders -->
  <div class="control-panel-card sticker-card no-tape">
    <div class="panel-header">
      <h3 class="panel-title font-display">🎛️ Live Sensitivity Control Panel</h3>
      <p class="panel-desc font-body">
        Drag sliders to see how NASA climate projections and your family's personal priorities re-weight the recommendations.
      </p>
    </div>

    <div class="sliders-grid">
      <!-- Farmer Priorities Column -->
      <div class="slider-group">
        <h4 class="group-title font-display">Farmer Priorities (Live Re-Weighting)</h4>
        <Slider 
          label="Water Conservation Weight" 
          icon="💧" 
          bind:value={priorities.water} 
          min={0} 
          max={100} 
          unit="%" 
        />
        <Slider 
          label="Immediate Income Weight" 
          icon="🪙" 
          bind:value={priorities.income} 
          min={0} 
          max={100} 
          unit="%" 
        />
        <Slider 
          label="Long-Term Soil Health" 
          icon="🌱" 
          bind:value={priorities.soilHealth} 
          min={0} 
          max={100} 
          unit="%" 
        />
        <Slider 
          label="Labor Availability Weight" 
          icon="🧤" 
          bind:value={priorities.labor} 
          min={0} 
          max={100} 
          unit="%" 
        />
      </div>

      <!-- Climate Stress Modifiers Column -->
      <div class="slider-group">
        <h4 class="group-title font-display">NASA Climate Scenario Stress-Test</h4>
        <Slider 
          label="Global Temperature Shift" 
          icon="🌡️" 
          bind:value={climate.tempOffset} 
          min={0} 
          max={3} 
          step={0.1}
          unit="°C" 
          formatValue={(v) => `+${v.toFixed(1)}°C`}
        />
        <Slider 
          label="Monsoon Rainfall Anomaly" 
          icon="🌧️" 
          bind:value={climate.rainOffset} 
          min={-20} 
          max={20} 
          step={1}
          unit="%" 
          formatValue={(v) => `${v > 0 ? '+' : ''}${v}%`}
        />

        <div class="panel-info-box">
          <span class="info-icon">ℹ️</span>
          <span class="font-body">
            NASA POWER & MERRA-2 models indicate that exceeding +1.5°C doubles heat-stress during summer pod fill. Notice how traditional rotations drop in score under high heat!
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .compare-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px 16px 48px;
    max-width: 1320px;
    margin: 0 auto;
  }

  .compare-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    background: linear-gradient(180deg, rgba(27, 43, 31, 0.04) 0%, transparent 100%);
    padding: 16px;
    border-radius: 8px;
  }

  .title {
    font-size: clamp(1.8rem, 3.5vw, 2.4rem);
    color: var(--journal-ink, #1B2B1F);
    margin: 0 0 6px;
  }

  .subtitle {
    font-size: 0.98rem;
    color: var(--journal-ink-soft, #2D4233);
    max-width: 720px;
    line-height: 1.5;
  }

  /* 3 Cards Table */
  .cards-table {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    align-items: stretch;
    margin: 8px 0;
  }

  .strategy-column {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  :global(.strategy-card) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    padding: 20px !important;
  }

  .winner-ribbon {
    background-color: var(--journal-forest, #1F3825);
    color: var(--journal-gold, #E5A93C);
    border: 2px solid var(--journal-gold, #E5A93C);
    border-radius: 6px;
    padding: 6px 14px;
    font-size: 0.82rem;
    font-weight: 700;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    margin-bottom: -10px;
    z-index: 5;
    letter-spacing: 0.5px;
    animation: ribbon-slide 300ms var(--spring) forwards;
  }

  @keyframes ribbon-slide {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .rotation-type-tag {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--journal-ink, #1B2B1F);
    background-color: #FAF2E3;
    border: 1.5px solid var(--journal-border, #1B2B1F);
    border-radius: 4px;
    padding: 2px 7px;
  }

  .score-badge {
    font-size: 0.84rem;
    font-weight: 700;
    color: #FAF7F0;
    background-color: var(--journal-forest, #1F3825);
    border: 1.5px solid var(--journal-border, #1B2B1F);
    border-radius: 6px;
    padding: 2px 9px;
  }

  .strategy-title {
    font-size: 1.45rem;
    color: var(--journal-ink, #1B2B1F);
    margin: 4px 0 0;
    line-height: 1.25;
  }

  .strategy-sub {
    font-size: 0.88rem;
    color: var(--journal-soil, #7E4A35);
    font-weight: 600;
  }

  .crop-rotation-flow {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .flow-label {
    font-size: 0.72rem;
    font-weight: bold;
    color: var(--journal-ink, #1B2B1F);
  }

  .pills-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .crop-pill {
    font-size: 0.78rem;
    background-color: #EBF4EE;
    border: 1.5px solid var(--journal-sage, #4E7C5A);
    color: var(--journal-forest, #1F3825);
    border-radius: 9999px;
    padding: 2px 9px;
    font-weight: 500;
  }

  .explanation-box {
    background-color: #FAF4E8;
    border-left: 3.5px solid var(--journal-gold, #E5A93C);
    padding: 8px 12px;
    border-radius: 0 6px 6px 0;
  }

  .why-text {
    font-size: 0.85rem;
    line-height: 1.4;
    color: var(--journal-ink-soft, #2D4233);
    margin: 0;
  }

  .evidence-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .section-label {
    font-size: 0.72rem;
    font-weight: bold;
    color: var(--journal-ink, #1B2B1F);
  }

  .chips-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .bullet-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 0.82rem;
  }

  .benefit-box {
    background-color: #F2F8F4;
    border: 1.5px solid var(--journal-sage, #4E7C5A);
    border-radius: 6px;
    padding: 10px;
  }

  .risk-box {
    background-color: #FCF4F2;
    border: 1.5px solid var(--journal-madder, #B83827);
    border-radius: 6px;
    padding: 10px;
  }

  .box-heading {
    display: block;
    font-size: 0.72rem;
    font-weight: bold;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .benefit-box .box-heading { color: var(--journal-sage, #4E7C5A); }
  .risk-box .box-heading { color: var(--journal-madder, #B83827); }

  .benefit-box ul, .risk-box ul {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0;
    margin: 0;
  }

  .benefit-box li::before {
    content: "✓ ";
    color: var(--journal-sage, #4E7C5A);
    font-weight: bold;
  }

  .risk-box li::before {
    content: "⚠ ";
    color: var(--journal-madder, #B83827);
    font-weight: bold;
  }

  .data-gap {
    font-style: italic;
    color: var(--journal-ink-muted, #556E5C);
  }

  .stamp-container {
    display: flex;
    justify-content: center;
    padding: 8px 0;
  }

  .card-footer-action {
    display: flex;
    justify-content: stretch;
    margin-top: auto;
    padding-top: 8px;
  }

  .card-footer-action :global(.vintage-btn) {
    width: 100%;
  }

  /* Control Panel */
  .control-panel-card {
    background-color: var(--journal-paper, #F9F6EE);
    border: 2.5px solid var(--journal-border, #1B2B1F);
    border-radius: var(--radius-md, 10px);
    box-shadow: 0 6px 0 var(--journal-border, #1B2B1F);
    padding: 24px;
  }

  .panel-header {
    margin-bottom: 16px;
    border-bottom: 1.5px solid rgba(27, 43, 31, 0.15);
    padding-bottom: 12px;
  }

  .panel-title {
    font-size: 1.45rem;
    color: var(--journal-ink, #1B2B1F);
    margin: 0 0 4px;
  }

  .panel-desc {
    font-size: 0.92rem;
    color: var(--journal-ink-soft, #2D4233);
    margin: 0;
  }

  .sliders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  .slider-group {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .group-title {
    font-size: 1.05rem;
    color: var(--journal-ink, #1B2B1F);
    border-bottom: 2px solid var(--journal-border, #1B2B1F);
    padding-bottom: 4px;
    margin: 0;
  }

  .panel-info-box {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background-color: #EDF5FA;
    border: 1.5px solid var(--journal-monsoon, #2B69A3);
    border-radius: 6px;
    padding: 12px;
    font-size: 0.84rem;
    line-height: 1.4;
    color: var(--journal-ink, #1B2B1F);
  }

  .info-icon {
    font-size: 1.15rem;
  }

  .sim-metrics-box {
    margin: 10px 0;
    padding: 10px 12px;
    background-color: #F8F3E6;
    border: 2px solid var(--journal-border, #1B2B1F);
    border-radius: 6px;
    font-size: 0.74rem;
  }

  .sim-metrics-title {
    font-weight: 700;
    color: var(--journal-soil, #7E4A35);
    margin-bottom: 6px;
    font-size: 0.72rem;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .sim-metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px 10px;
    color: var(--journal-ink, #1B2B1F);
  }
</style>
