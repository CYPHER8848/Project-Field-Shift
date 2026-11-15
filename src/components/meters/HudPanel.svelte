<script lang="ts">
  import type { FarmMeters, EraInfo, RegionInfo } from '../../types/game';
  import WaterJarMeter from './WaterJarMeter.svelte';
  import SoilProfileMeter from './SoilProfileMeter.svelte';
  import ErosionGaugeMeter from './ErosionGaugeMeter.svelte';
  import CoinStackMeter from './CoinStackMeter.svelte';
  import SproutMeter from './SproutMeter.svelte';

  interface Props {
    meters: FarmMeters;
    currentEra: EraInfo;
    currentRegion: RegionInfo;
    seasonName?: string;
  }

  let { meters, currentEra, currentRegion, seasonName = "Kharif (Monsoon)" }: Props = $props();
</script>

<div class="hud-panel">
  <!-- Status & Era Badge Header -->
  <div class="hud-badge-strip">
    <div class="badge-pill era-pill font-display">
      <span class="pill-icon">⏳</span>
      <span>{currentEra.year}</span>
      <span class="sub font-data">[{currentEra.label}]</span>
    </div>

    <div class="badge-pill region-pill font-display">
      <span class="pill-icon">📍</span>
      <span>{currentRegion.name}</span>
    </div>

    <div class="badge-pill season-pill font-body">
      <span class="pill-icon">☀️</span>
      <span>{seasonName}</span>
    </div>

    <div class="water-draw-tag font-data">
      <span>Seasonal Water Draw:</span>
      <strong>{meters.waterUse} mm</strong>
    </div>
  </div>

  <!-- 5 Tactile Handcrafted Jars & Meters Row -->
  <div class="meters-row">
    <WaterJarMeter value={meters.soilMoisture} label="Soil Moisture" />
    <SoilProfileMeter value={meters.organicMatter} label="Organic Matter" />
    <SproutMeter value={meters.nitrogen} label="Nitrogen Bio" />
    <ErosionGaugeMeter value={meters.erosionRisk} label="Erosion Risk" />
    <CoinStackMeter value={meters.income} label="Vault Coins" />
  </div>
</div>

<style>
  .hud-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: var(--journal-paper, #F9F6EE);
    border: var(--border-ink, 2.5px solid #1B2B1F);
    border-radius: var(--radius-md, 10px);
    padding: 16px;
    box-shadow: var(--shadow-pressable, 0 4px 0 #1B2B1F);
  }

  .hud-badge-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
    padding-bottom: 10px;
    border-bottom: 1.5px dashed rgba(27, 43, 31, 0.3);
  }

  .badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 2px solid var(--journal-border, #1B2B1F);
    border-radius: 9999px;
    padding: 4px 14px;
    box-shadow: 0 2px 0 var(--journal-border, #1B2B1F);
    font-size: 0.88rem;
    font-weight: 600;
  }

  .era-pill {
    background-color: var(--journal-gold, #E5A93C);
    color: var(--journal-ink, #1B2B1F);
  }

  .era-pill .sub {
    font-size: 0.72rem;
    font-weight: normal;
    color: var(--journal-ink-soft, #2D4233);
  }

  .region-pill {
    background-color: #EAF2EC;
    color: var(--journal-forest, #1F3825);
    border-color: var(--journal-border, #1B2B1F);
  }

  .season-pill {
    background-color: #EDF5FA;
    color: var(--journal-monsoon, #2B69A3);
    font-weight: 600;
  }

  .water-draw-tag {
    font-size: 0.76rem;
    color: var(--journal-ink, #1B2B1F);
    background-color: var(--journal-surface-warm, #FAF7F0);
    border: 1.5px solid var(--journal-border, #1B2B1F);
    border-radius: 6px;
    padding: 4px 10px;
  }

  .meters-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
    gap: 10px;
  }

  @media (max-width: 768px) {
    .meters-row {
      overflow-x: auto;
      justify-content: flex-start;
      padding-bottom: 6px;
    }
  }
</style>
