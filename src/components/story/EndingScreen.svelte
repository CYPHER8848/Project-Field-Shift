<script lang="ts">
  import type { EndingResult, HariDecision } from './storyEngine';
  import type { FarmMeters } from '../../types/game';
  import StickerCard from '../common/StickerCard.svelte';
  import Button from '../common/Button.svelte';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';
  import RubberStamp from '../common/RubberStamp.svelte';
  import WaterJarMeter from '../meters/WaterJarMeter.svelte';
  import SoilProfileMeter from '../meters/SoilProfileMeter.svelte';
  import SproutMeter from '../meters/SproutMeter.svelte';
  import ErosionGaugeMeter from '../meters/ErosionGaugeMeter.svelte';
  import CoinStackMeter from '../meters/CoinStackMeter.svelte';

  interface Props {
    ending: EndingResult;
    decisions: HariDecision[];
    finalMeters: FarmMeters;
    onRestart: () => void;
  }

  let { ending, decisions, finalMeters, onRestart }: Props = $props();

  let showGlossary = $state(false);

  const GLOSSARY_ITEMS = [
    { term: '1. Kharif', def: 'The monsoon cropping season (June to October/November) traditionally anchored by paddy rice or millets.' },
    { term: '2. Rabi', def: 'The winter cropping season (November to April) typically planted with wheat, mustard, or chickpeas.' },
    { term: '3. GWETROOT', def: 'NASA MERRA-2 modelled root-zone soil wetness anomaly (0–1 fraction). It reflects estimated water where crop roots drink.' },
    { term: '4. PRECTOTCORR', def: 'Corrected daily total precipitation (mm/day) derived from NASA satellite assimilation.' },
    { term: '5. ALLSKY_SFC_SW_DWN', def: 'All-sky surface shortwave solar irradiance (MJ/m²/day), driving crop evapotranspiration.' },
    { term: '6. Biological Nitrogen Fixation', def: 'Natural process where legume root nodules (Rhizobium) convert atmospheric N2 into bio-available soil nitrogen.' },
    { term: '7. Soil Organic Matter (SOM)', def: 'Decomposed biological humus that increases soil porosity, spongy water retention, and microbial life.' },
    { term: '8. Aquifer Anomaly (GRACE)', def: 'Gravimetric satellite measurement of regional terrestrial water mass drawdown over time.' },
    { term: '9. Sheet & Rill Erosion', def: 'Loss of nutrient-dense topsoil caused by unchecked surface runoff on bare, uncanopied land.' },
    { term: '10. Scenario Modelling', def: 'A “what-if” projection showing sensitivity to temperature and rainfall assumptions. It is an exploration tool, not a crystal ball.' }
  ];
</script>

<div class="ending-page">
  <div class="ending-card sticker-card no-tape">
    <div class="ending-header">
      <span class="badge font-data">50-YEAR CHRONICLE OF AMMA’S FIELD</span>
      <div class="rating-box font-display">GRADE {ending.rating}</div>
    </div>

    <h1 class="ending-title font-display">{ending.title}</h1>
    <div class="badge-tag font-display">{ending.badge}</div>

    <BlockPrintBorder height={14} variant="phulkari" />

    <p class="summary-text font-body">{ending.summary}</p>

    <!-- Final Meters Status -->
    <div class="final-meters-box">
      <div class="box-title font-display">Final Farm State (Year 2040)</div>
      <div class="meters-row">
        <WaterJarMeter value={finalMeters.soilMoisture} label="Soil Moisture" />
        <SoilProfileMeter value={finalMeters.organicMatter} label="Organic Matter" />
        <SproutMeter value={finalMeters.nitrogen} label="Nitrogen Bio" />
        <ErosionGaugeMeter value={finalMeters.erosionRisk} label="Erosion Risk" />
        <CoinStackMeter value={finalMeters.income} label="Vault Coins" />
      </div>
    </div>

    <!-- Decisions Journey Timeline -->
    <div class="decisions-section">
      <div class="section-heading font-display">Hari’s 50-Year Decision Logbook</div>
      <div class="decisions-list">
        {#each decisions as dec}
          <div class="dec-item">
            <span class="dec-year font-display">[{dec.chapterId.slice(3, 7)}]</span>
            <div class="dec-body">
              <strong class="dec-title font-body">{dec.decisionTitle}:</strong>
              <span class="dec-choice font-body">{dec.choiceMade}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- NASA Satellite Assessment Card -->
    <div class="nasa-card sticker-card no-tape">
      <div class="nasa-head">
        <span class="font-data nasa-head-label">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
          </svg>
          NASA OBSERVATION VERIFICATION
        </span>
        <RubberStamp text="MISSION COMPLETE" subtext="NASA Space Apps 2026" angle={-4} size="sm" />
      </div>
      <p class="nasa-text font-data">{ending.nasaEvaluation}</p>
    </div>

    <!-- Farmer Reflection Prompts from DOCX -->
    <div class="reflections-section sticker-card no-tape">
      <div class="section-heading font-display">Farmer Reflection Prompts (2040 Decision)</div>
      <p class="reflection-intro font-body">Field Shift does not decide for the farm. Reflect on how your choices behaved:</p>
      <div class="reflections-grid">
        <div class="reflection-item">
          <span class="q-tag font-data">QUESTION 1 · MONSOON DELAY</span>
          <p class="q-text font-body">If the monsoon is delayed 3 weeks, which rotation avoids tubewell failure?</p>
        </div>
        <div class="reflection-item">
          <span class="q-tag font-data">QUESTION 2 · GROUNDWATER POLICY</span>
          <p class="q-text font-body">If groundwater extraction is taxed or rationed, does the baseline paddy-wheat path remain viable?</p>
        </div>
        <div class="reflection-item">
          <span class="q-tag font-data">QUESTION 3 · LOCAL CONTRACTS</span>
          <p class="q-text font-body">What local seed varieties or mandi contracts would make crop diversification safer for your family?</p>
        </div>
      </div>
    </div>

    <!-- Ethical Mandate Verbatim from DOCX -->
    <div class="mandate-banner font-body">
      <em>"Field Shift supports farmers and local experts. It does not replace their judgement."</em>
    </div>

    <!-- Actions Row -->
    <div class="restart-row">
      <Button variant="secondary" size="md" onclick={() => showGlossary = true}>
        Open Agricultural Glossary
      </Button>
      <Button variant="primary" size="lg" onclick={onRestart}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; vertical-align:middle; margin-right:6px;">
          <path d="M1 4v6h6M23 20v-6h-6"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
        </svg>
        Play Hari’s Story Again
      </Button>
    </div>
  </div>

  <!-- Glossary Modal -->
  {#if showGlossary}
    <div 
      class="modal-backdrop" 
      role="presentation"
      onclick={() => showGlossary = false}
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div 
        class="modal-card" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="glossary-title" 
        tabindex="-1"
        onclick={(e) => e.stopPropagation()}
      >
        <div class="modal-head">
          <h2 id="glossary-title" class="font-display">Agricultural Glossary</h2>
          <button type="button" class="close-btn" onclick={() => showGlossary = false} aria-label="Close glossary modal">✕</button>
        </div>
        <p class="modal-sub font-body">Reference definitions from the Punjab field study:</p>
        <div class="glossary-list">
          {#each GLOSSARY_ITEMS as item}
            <div class="glossary-entry">
              <strong class="font-data term">{item.term}</strong>
              <p class="font-body def">{item.def}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .ending-page {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--space-4) var(--space-2);
    min-height: calc(100vh - 40px);
  }

  .ending-card {
    max-width: 820px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    background-color: var(--paper);
    border: var(--outline-thick);
  }

  .ending-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--ink);
    padding-bottom: 6px;
  }

  .badge {
    font-size: 0.75rem;
    font-weight: bold;
    color: var(--soil);
  }

  .rating-box {
    background-color: var(--turmeric);
    color: var(--ink);
    border: 2.5px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 4px 12px;
    font-size: 1.15rem;
    box-shadow: 0 2px 0 var(--ink);
  }

  .ending-title {
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    color: var(--ink);
    margin: 0;
    transform: rotate(-1deg);
  }

  .badge-tag {
    font-size: 0.92rem;
    color: var(--paddy);
    margin-top: -6px;
  }

  .summary-text {
    font-size: 1.05rem;
    line-height: 1.5;
    color: var(--ink);
  }

  .final-meters-box {
    background-color: color-mix(in srgb, var(--paper) 90%, var(--soil));
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .box-title {
    font-size: 1rem;
    text-align: center;
  }

  .meters-row {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 8px;
  }

  .decisions-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-heading {
    font-size: 1.15rem;
    color: var(--ink);
  }

  .decisions-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .dec-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--paper);
    border: 1.5px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    box-shadow: 0 1px 0 var(--ink);
  }

  .dec-year {
    font-size: 0.95rem;
    color: var(--turmeric);
    background-color: var(--ink);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .dec-body {
    font-size: 0.88rem;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .nasa-card {
    background-color: color-mix(in srgb, var(--monsoon) 12%, var(--paper));
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .nasa-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nasa-head-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    font-weight: bold;
    color: var(--monsoon);
  }

  .nasa-text {
    font-size: 0.82rem;
    line-height: 1.35;
    color: var(--ink);
  }

  .reflections-section {
    background-color: color-mix(in srgb, var(--turmeric) 15%, var(--paper));
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .reflection-intro {
    font-size: 0.9rem;
    margin: 0;
    color: var(--ink);
  }

  .reflections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
  }

  .reflection-item {
    background: var(--paper);
    border: 1.5px solid var(--ink);
    border-radius: 4px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .q-tag {
    font-size: 0.68rem;
    font-weight: bold;
    color: var(--soil);
  }

  .q-text {
    font-size: 0.82rem;
    margin: 0;
    line-height: 1.35;
    color: var(--ink);
  }

  .mandate-banner {
    background-color: var(--ink);
    color: var(--paper);
    padding: 10px 14px;
    border-radius: 4px;
    text-align: center;
    font-size: 0.92rem;
  }

  .restart-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding-top: var(--space-2);
    flex-wrap: wrap;
  }

  /* Modal Backdrop & Card */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }

  .modal-card {
    background-color: var(--paper);
    border: 3px solid var(--ink);
    border-radius: var(--radius-md);
    max-width: 640px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    padding: 24px;
    box-shadow: 8px 8px 0 var(--ink);
  }

  .modal-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--ink);
    padding-bottom: 8px;
    margin-bottom: 12px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
  }

  .modal-sub {
    font-size: 0.88rem;
    color: var(--soil);
    margin-bottom: 14px;
  }

  .glossary-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .glossary-entry {
    background: color-mix(in srgb, var(--paper) 95%, var(--ink));
    border: 1px solid var(--ink);
    border-radius: 4px;
    padding: 8px 12px;
  }

  .term {
    display: block;
    font-size: 0.85rem;
    color: var(--ink);
    margin-bottom: 2px;
  }

  .def {
    font-size: 0.82rem;
    color: var(--soil);
    margin: 0;
    line-height: 1.35;
  }
</style>
