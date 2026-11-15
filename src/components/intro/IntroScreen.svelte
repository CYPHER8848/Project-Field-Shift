<script lang="ts">
  import { ERAS, AMMA_DIALOGS } from '../../data/mockData';
  import StickerCard from '../common/StickerCard.svelte';
  import Button from '../common/Button.svelte';
  import AmmaBubble from '../common/AmmaBubble.svelte';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';

  interface Props {
    onStartGame: () => void;
    onViewStyleguide: () => void;
    onViewNasaDocs: () => void;
  }

  let { onStartGame, onViewStyleguide, onViewNasaDocs }: Props = $props();
</script>

<div class="intro-page">
  <!-- Vintage Botanical Seed-Packet Hero Card -->
  <div class="hero-packet journal-sticker-card">
    <div class="masking-tape" aria-hidden="true"></div>

    <div class="packet-top-badge font-data">
      <span>NASA SPACE APPS 2026 · PROJECT FIELD SHIFT</span>
      <span>BOTANICAL ALMANAC & SIMULATION</span>
    </div>

    <div class="packet-header">
      <div class="seed-seal" aria-hidden="true">
        <svg viewBox="0 0 90 90" width="80" height="80">
          <!-- Outer scalloped botanical seal -->
          <circle cx="45" cy="45" r="42" fill="var(--journal-gold, #E5A93C)" stroke="var(--journal-border, #1B2B1F)" stroke-width="2.5" />
          <circle cx="45" cy="45" r="36" fill="none" stroke="var(--journal-border, #1B2B1F)" stroke-width="1.2" stroke-dasharray="3 3" />
          <!-- Botanical sprout motif -->
          <path d="M 45 22 Q 52 36 62 44 Q 45 49 45 66 Q 45 49 28 44 Q 38 36 45 22 Z" fill="var(--journal-forest, #1F3825)" stroke="var(--journal-border, #1B2B1F)" stroke-width="2" />
          <circle cx="45" cy="45" r="3" fill="var(--journal-gold, #E5A93C)" />
        </svg>
      </div>

      <h1 class="main-title font-display">FIELD SHIFT</h1>
      <div class="tagline font-display">Four Seasons of Amma's Field</div>
      <p class="subtitle font-body">
        An interactive agricultural field journal. Inherit an ancestral family farm, examine 45 years of continuous NASA Earth observations, and discover climate-smart crop rotations across changing seasons.
      </p>
    </div>

    <BlockPrintBorder height={18} />

    <!-- Amma's Introduction Speech Bubble -->
    <AmmaBubble text={AMMA_DIALOGS.intro} sublabel="Amma's Welcome (1990)" />

    <!-- 4 Eras Timeline Preview -->
    <div class="eras-preview-section">
      <div class="section-title font-display">The Four Eras of Your Journey</div>
      <div class="eras-grid">
        {#each ERAS as era, idx}
          <div class="era-card">
            <div class="era-header">
              <span class="era-year font-display">{era.year}</span>
              <span class="era-label font-data">[{era.label}]</span>
            </div>
            <p class="era-desc font-body">{era.description}</p>
            <div class="era-stat font-data">
              Temp Anomaly: <strong>+{era.tempAnomaly}°C</strong>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Call to Action Buttons -->
    <div class="actions-row">
      <Button variant="primary" size="lg" onclick={onStartGame}>
        Begin Farm Journey (1990) →
      </Button>
      <Button variant="secondary" size="md" onclick={onViewNasaDocs}>
        🛰️ NASA Satellite Sources
      </Button>
      <Button variant="secondary" size="md" onclick={onViewStyleguide}>
        🎨 Design Styleguide
      </Button>
    </div>
  </div>
</div>

<style>
  .intro-page {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 36px 16px;
    min-height: calc(100vh - 56px);
    background: radial-gradient(circle at center, #1B2D20 0%, #121A14 100%);
  }

  .hero-packet {
    max-width: 920px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 32px 36px;
    background-color: var(--journal-paper, #F9F6EE);
    border: 3px solid var(--journal-border, #1B2B1F);
    border-radius: var(--radius-lg, 16px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), 0 6px 0 var(--journal-border, #1B2B1F);
    position: relative;
  }

  .masking-tape {
    position: absolute;
    top: -12px;
    left: 48px;
    width: 80px;
    height: 24px;
    background-color: rgba(235, 226, 203, 0.88);
    border: 1px solid rgba(180, 168, 140, 0.45);
    transform: rotate(-2.5deg);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .packet-top-badge {
    display: flex;
    justify-content: space-between;
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--journal-ink-muted, #556E5C);
    border-bottom: 2px solid var(--journal-border, #1B2B1F);
    padding-bottom: 8px;
    letter-spacing: 1px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .packet-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
    margin-top: 4px;
  }

  .seed-seal {
    margin-bottom: 4px;
  }

  .main-title {
    font-size: clamp(2.6rem, 6.5vw, 4rem);
    letter-spacing: 0.02em;
    color: var(--journal-ink, #1B2B1F);
    margin: 0;
    line-height: 1;
  }

  .tagline {
    font-size: clamp(1.2rem, 3.2vw, 1.65rem);
    color: var(--journal-soil, #7E4A35);
    font-weight: 500;
    margin-top: 2px;
  }

  .subtitle {
    font-size: 1.05rem;
    max-width: 660px;
    color: var(--journal-ink-soft, #2D4233);
    line-height: 1.5;
    margin-top: 4px;
  }

  .eras-preview-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-title {
    font-size: 1.35rem;
    color: var(--journal-ink, #1B2B1F);
    text-align: center;
  }

  .eras-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 14px;
  }

  .era-card {
    background-color: var(--journal-surface-warm, #FAF7F0);
    border: 2px solid var(--journal-border, #1B2B1F);
    border-radius: var(--radius-sm, 6px);
    padding: 14px;
    box-shadow: 0 3px 0 var(--journal-border, #1B2B1F);
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: transform 120ms ease;
  }

  .era-card:hover {
    transform: translateY(-2px);
  }

  .era-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 6px;
  }

  .era-year {
    font-size: 1.45rem;
    color: var(--journal-ink, #1B2B1F);
    line-height: 1;
    font-weight: 700;
  }

  .era-label {
    font-size: 0.7rem;
    color: var(--journal-soil, #7E4A35);
    font-weight: bold;
  }

  .era-desc {
    font-size: 0.82rem;
    line-height: 1.35;
    color: var(--journal-ink-soft, #2D4233);
    flex-grow: 1;
  }

  .era-stat {
    font-size: 0.72rem;
    color: var(--journal-madder, #B83827);
    border-top: 1px dashed rgba(27, 43, 31, 0.25);
    padding-top: 6px;
    margin-top: 4px;
  }

  .actions-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    padding-top: 8px;
  }

  @media (max-width: 640px) {
    .hero-packet {
      padding: 24px 18px;
    }
    .actions-row {
      flex-direction: column;
    }
    .actions-row :global(.vintage-btn) {
      width: 100%;
    }
  }
</style>
