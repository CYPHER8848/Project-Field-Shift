<script lang="ts">
  import { REGIONS } from '../../data/mockData';
  import type { RegionInfo } from '../../types/game';
  import StickerCard from '../common/StickerCard.svelte';
  import Button from '../common/Button.svelte';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';

  interface Props {
    onSelectRegion: (region: RegionInfo) => void;
    onBack?: () => void;
  }

  let { onSelectRegion, onBack }: Props = $props();

  const regionsList = Object.values(REGIONS);

  // Regional aesthetic configurations
  const regionalMeta: Record<string, {
    borderVariant: 'phulkari' | 'tanjore' | 'midwest' | 'sahel';
    tapeColor: string;
    cardClass: string;
    artisticLabel: string;
    accentColor: string;
  }> = {
    punjab: {
      borderVariant: 'phulkari',
      tapeColor: 'rgba(242, 163, 27, 0.85)',
      cardClass: 'region-punjab',
      artisticLabel: 'Phulkari Floral & Alluvial Basin',
      accentColor: '#C0292B'
    },
    karnataka: {
      borderVariant: 'tanjore',
      tapeColor: 'rgba(223, 155, 26, 0.85)',
      cardClass: 'region-karnataka',
      artisticLabel: 'Tanjore Gilded Heritage & Deccan Earth',
      accentColor: '#A43C25'
    },
    iowa: {
      borderVariant: 'midwest',
      tapeColor: 'rgba(232, 170, 21, 0.85)',
      cardClass: 'region-iowa',
      artisticLabel: 'Midwestern Prairie Loam & Grain Belt',
      accentColor: '#2B6E3B'
    },
    sahel: {
      borderVariant: 'sahel',
      tapeColor: 'rgba(214, 122, 38, 0.85)',
      cardClass: 'region-sahel',
      artisticLabel: 'Sahelian Sun-Baked Dunes & Acacia',
      accentColor: '#7C3B22'
    }
  };
</script>

<div class="region-select-page">
  <div class="header-section">
    <div class="header-titles">
      <span class="eyebrow font-data">AGRICULTURAL FIELD JOURNAL · PROVENANCE</span>
      <h2 class="page-title font-display">Select Your Farm Region</h2>
      <p class="page-desc font-body">
        Choose an agro-ecological landscape to steward. Each demonstration site features authentic 45-year NASA POWER meteorology, NASA GRACE groundwater trends, and local agronomic heritage.
      </p>
    </div>
    {#if onBack}
      <Button variant="secondary" size="sm" onclick={onBack}>← Back to Story</Button>
    {/if}
  </div>

  <BlockPrintBorder height={16} />

  <div class="regions-grid">
    {#each regionsList as reg, i}
      {@const meta = regionalMeta[reg.id] ?? regionalMeta.punjab}
      {@const tilt = i % 2 === 0 ? -0.8 : 0.8}

      <StickerCard tilt={tilt} tapeColor={meta.tapeColor} class="region-card {meta.cardClass}">
        <!-- Regional Art Motif Strip -->
        <div class="card-motif-header">
          <BlockPrintBorder variant={meta.borderVariant} height={14} color={meta.accentColor} />
          <span class="art-heritage-label font-data">{meta.artisticLabel}</span>
        </div>

        <div class="region-top">
          <span class="region-badge font-data">{reg.badge}</span>
          <span class="country-tag font-data">{reg.country}</span>
        </div>

        <h3 class="region-name font-display">{reg.name}</h3>
        <p class="region-desc font-body">{reg.landscapeDescription}</p>

        <div class="challenge-box">
          <div class="box-tag font-data">⚠️ Climate Stress</div>
          <p class="challenge-text font-body">{reg.climateChallenge}</p>
        </div>

        <div class="satellite-callout">
          <div class="callout-tag font-data">🛰️ NASA GRACE Groundwater Benchmark</div>
          <p class="callout-text font-data">{reg.graceGroundwaterTrend}</p>
        </div>

        <div class="crops-tag-strip">
          <span class="font-data strip-label">Primary Crops:</span>
          {#each reg.primaryCrops as crop}
            <span class="crop-tag font-body">{crop}</span>
          {/each}
        </div>

        <div class="card-action">
          <Button variant="primary" size="md" onclick={() => onSelectRegion(reg)}>
            Farm in {reg.name} →
          </Button>
        </div>
      </StickerCard>
    {/each}
  </div>
</div>

<style>
  .region-select-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 1240px;
    margin: 0 auto;
    padding: 24px 16px 48px;
  }

  .header-section {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    background: linear-gradient(180deg, rgba(27, 43, 31, 0.04) 0%, transparent 100%);
    padding: 16px;
    border-radius: 8px;
  }

  .eyebrow {
    display: block;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: var(--journal-sage, #4E7C5A);
    margin-bottom: 4px;
  }

  .page-title {
    font-size: clamp(1.8rem, 3.5vw, 2.5rem);
    color: var(--journal-ink, #1B2B1F);
    margin: 0 0 6px;
  }

  .page-desc {
    font-size: 0.98rem;
    color: var(--journal-ink-soft, #2D4233);
    max-width: 720px;
    line-height: 1.5;
  }

  .regions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    align-items: stretch;
  }

  :global(.region-card) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    padding: 18px 20px !important;
  }

  .card-motif-header {
    margin-bottom: -4px;
  }

  .art-heritage-label {
    display: block;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--journal-ink-muted, #556E5C);
    margin-top: 2px;
  }

  .region-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .region-badge {
    background-color: var(--journal-gold, #E5A93C);
    color: var(--journal-ink, #1B2B1F);
    border: 1.5px solid var(--journal-border, #1B2B1F);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 0.72rem;
    font-weight: bold;
    letter-spacing: 0.4px;
  }

  .country-tag {
    font-size: 0.75rem;
    color: var(--journal-ink-muted, #556E5C);
    font-weight: 500;
  }

  .region-name {
    font-size: 1.55rem;
    color: var(--journal-ink, #1B2B1F);
    margin: 0;
  }

  .region-desc {
    font-size: 0.9rem;
    color: var(--journal-ink-soft, #2D4233);
    line-height: 1.45;
    flex-grow: 1;
  }

  .challenge-box {
    background-color: #FDF3F1;
    border: 2px solid var(--journal-madder, #B83827);
    border-radius: 6px;
    padding: 10px 12px;
  }

  .box-tag {
    font-size: 0.72rem;
    font-weight: bold;
    color: var(--journal-madder, #B83827);
    margin-bottom: 2px;
  }

  .challenge-text {
    font-size: 0.84rem;
    line-height: 1.35;
    color: var(--journal-ink, #1B2B1F);
  }

  .satellite-callout {
    background-color: #EDF5FA;
    border: 1.5px solid var(--journal-monsoon, #2B69A3);
    border-radius: 6px;
    padding: 10px 12px;
  }

  .callout-tag {
    font-size: 0.7rem;
    font-weight: bold;
    color: var(--journal-monsoon, #2B69A3);
    margin-bottom: 2px;
  }

  .callout-text {
    font-size: 0.78rem;
    line-height: 1.35;
    color: var(--journal-ink, #1B2B1F);
  }

  .crops-tag-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    font-size: 0.76rem;
    padding: 4px 0;
  }

  .strip-label {
    font-weight: bold;
    color: var(--journal-ink, #1B2B1F);
  }

  .crop-tag {
    background-color: #E8F3EB;
    border: 1px solid var(--journal-sage, #4E7C5A);
    color: var(--journal-forest, #1F3825);
    border-radius: 4px;
    padding: 2px 8px;
    font-weight: 500;
  }

  .card-action {
    margin-top: 8px;
    display: flex;
  }

  .card-action :global(.vintage-btn) {
    width: 100%;
  }

  /* Specific Regional Accents */
  :global(.region-punjab) {
    border-top: 5px solid #C0292B !important;
  }
  :global(.region-karnataka) {
    border-top: 5px solid #DF9B1A !important;
  }
  :global(.region-iowa) {
    border-top: 5px solid #2B6E3B !important;
  }
  :global(.region-sahel) {
    border-top: 5px solid #D67A26 !important;
  }
</style>
