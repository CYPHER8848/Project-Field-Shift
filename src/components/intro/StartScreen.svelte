<script lang="ts">
  import Button from '../common/Button.svelte';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';

  interface Props {
    onPlay: () => void;
    isMuted?: boolean;
    onToggleSound?: () => void;
  }

  let { onPlay, isMuted = false, onToggleSound }: Props = $props();

  let showInfoModal = $state(false);
  let showSettingsModal = $state(false);
</script>

<div class="start-screen-container">
  <div class="start-card journal-sticker-card">
    <div class="card-badge font-data">NASA SPACE APPS 2026 · PROJECT FIELD SHIFT</div>

    <div class="hero-center">
      <div class="farm-emblem" aria-hidden="true">
        <svg viewBox="0 0 96 96" width="90" height="90">
          <!-- Outer gold scalloped ring -->
          <circle cx="48" cy="48" r="44" fill="var(--journal-gold, #E5A93C)" stroke="var(--journal-ink, #1B2B1F)" stroke-width="2.5" />
          <circle cx="48" cy="48" r="38" fill="none" stroke="var(--journal-ink, #1B2B1F)" stroke-width="1.2" stroke-dasharray="3 3" />
          <!-- Sun rays -->
          {#each [0, 45, 90, 135, 180, 225, 270, 315] as angle}
            <line 
              x1={48 + Math.cos(angle * Math.PI / 180) * 32} 
              y1={48 + Math.sin(angle * Math.PI / 180) * 32} 
              x2={48 + Math.cos(angle * Math.PI / 180) * 36} 
              y2={48 + Math.sin(angle * Math.PI / 180) * 36} 
              stroke="var(--journal-ink, #1B2B1F)" 
              stroke-width="2" 
            />
          {/each}
          <!-- Central wheat & paddy sprout -->
          <path d="M 48 24 Q 56 38 66 46 Q 48 52 48 72 Q 48 52 30 46 Q 40 38 48 24 Z" fill="var(--journal-forest, #1F3825)" stroke="var(--journal-ink, #1B2B1F)" stroke-width="2" />
          <circle cx="48" cy="48" r="3.5" fill="var(--journal-gold, #E5A93C)" />
        </svg>
      </div>

      <h1 class="main-title font-display">AMMA'S FARM</h1>
      <p class="main-lead font-body">
        Four seasons on a family farm. Decisions that echo beyond one harvest.
      </p>
    </div>

    <BlockPrintBorder height={14} variant="phulkari" />

    <!-- Primary Interaction: Play (No emojis) -->
    <div class="start-actions">
      <button type="button" class="play-btn font-display" onclick={onPlay}>
        PLAY
      </button>

      <!-- Secondary Links: Info & Settings (SVG icons, no emojis) -->
      <div class="secondary-links">
        <button type="button" class="meta-link font-body" onclick={() => showInfoModal = true}>
          <svg class="meta-svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
            <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <circle cx="12" cy="8" r="1.2" fill="currentColor" />
          </svg>
          <span>Info</span>
        </button>
        <span class="divider">·</span>
        <button type="button" class="meta-link font-body" onclick={() => showSettingsModal = true}>
          <svg class="meta-svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="1.8" fill="none" />
          </svg>
          <span>Settings</span>
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Info Modal -->
{#if showInfoModal}
  <div 
    class="modal-backdrop" 
    onclick={() => showInfoModal = false} 
    onkeydown={(e) => { if (e.key === 'Escape') showInfoModal = false; }}
    role="button" 
    tabindex="0"
    aria-label="Close info modal"
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="modal-card" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
      <div class="modal-header">
        <h2 class="modal-title font-display">About Field Shift</h2>
        <button class="close-btn" onclick={() => showInfoModal = false}>✕</button>
      </div>
      <div class="modal-body font-body">
        <p>
          <strong>Project Field Shift</strong> is an interactive agricultural field journal set in Punjab, India. It follows a family through the familiar paddy-to-wheat seasonal rhythm from 1990 to 2040.
        </p>

        <!-- NASA Earth Science Observations Section -->
        <div class="nasa-info-section">
          <div class="section-badge font-data">NASA EARTH SCIENCE OBSERVATIONS & TELEMETRY</div>
          <div class="nasa-grid">
            <div class="nasa-item">
              <strong>NASA POWER (MERRA-2)</strong>
              <span>Surface solar radiation (ALLSKY_SFC_SW_DWN), precipitation (PRECTOTCORR), and evaporative demand (EVLAND).</span>
            </div>
            <div class="nasa-item">
              <strong>NASA GRACE / GRACE-FO</strong>
              <span>Gravimetric satellite measurement of regional terrestrial water storage loss (−3.2 cm/yr in Punjab aquifer).</span>
            </div>
            <div class="nasa-item">
              <strong>NASA SMAP & MODIS</strong>
              <span>L-band root-zone soil moisture anomaly (GWETROOT) and vegetation canopy health (NDVI).</span>
            </div>
          </div>

          <div class="limits-box">
            <strong>Scientific Limitations (Three Satellite Boundaries):</strong>
            <ol>
              <li><strong>Regional Scale:</strong> NASA POWER reflects ~50km grid resolution, not individual 2-hectare plot variances.</li>
              <li><strong>Modelled Proxies:</strong> GWETROOT is a land-surface model simulation, not a buried soil probe.</li>
              <li><strong>Missing Farm Specifics:</strong> Satellites cannot detect tractor pan compaction, canal roster delays, or farmer market debt.</li>
            </ol>
          </div>
        </div>

        <div class="callout-box">
          <strong>Our Ethical Mandate:</strong> Field Shift is an educational decision support aid—never a black-box yield forecast or farming recommendation. It supports farmers and local experts without replacing their judgement.
        </div>
      </div>
      <div class="modal-footer">
        <Button variant="primary" size="md" onclick={() => showInfoModal = false}>Close</Button>
      </div>
    </div>
  </div>
{/if}

<!-- Settings Modal -->
{#if showSettingsModal}
  <div 
    class="modal-backdrop" 
    onclick={() => showSettingsModal = false} 
    onkeydown={(e) => { if (e.key === 'Escape') showSettingsModal = false; }}
    role="button" 
    tabindex="0"
    aria-label="Close settings modal"
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="modal-card" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
      <div class="modal-header">
        <h2 class="modal-title font-display">Settings</h2>
        <button class="close-btn" onclick={() => showSettingsModal = false}>✕</button>
      </div>
      <div class="modal-body font-body">
        <div class="setting-item">
          <div>
            <div class="setting-label">Sound & Audio Blips</div>
            <div class="setting-hint">Toggle 8-bit text audio and environmental sounds</div>
          </div>
          <button type="button" class="toggle-btn {isMuted ? 'muted' : 'active'}" onclick={onToggleSound}>
            {#if isMuted}
              <span>MUTED</span>
            {:else}
              <span>AUDIO ON</span>
            {/if}
          </button>
        </div>

        <div class="setting-item">
          <div>
            <div class="setting-label">Visual Theme</div>
            <div class="setting-hint">Illustrated Botanical Field Journal</div>
          </div>
          <span class="theme-badge font-data">Botanical Archive</span>
        </div>
      </div>
      <div class="modal-footer">
        <Button variant="primary" size="md" onclick={() => showSettingsModal = false}>Done</Button>
      </div>
    </div>
  </div>
{/if}

<style>
  .start-screen-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 60px);
    padding: 32px 16px;
    background: radial-gradient(circle at center, #1E3324 0%, #111A13 100%);
  }

  .start-card {
    max-width: 620px;
    width: 100%;
    background-color: var(--journal-paper, #FAF6ED);
    border: 3px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 8px 0 var(--journal-ink, #1B2B1F);
    border-radius: var(--radius-md, 8px);
    padding: 36px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    text-align: center;
  }

  .card-badge {
    font-size: 0.72rem;
    letter-spacing: 1.5px;
    color: var(--journal-gold, #D98E16);
    font-weight: 700;
  }

  .hero-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .farm-emblem {
    margin-bottom: 4px;
    filter: drop-shadow(0 3px 0 var(--journal-ink, #1B2B1F));
  }

  .main-title {
    font-size: 2.5rem;
    line-height: 1.1;
    color: var(--journal-forest, #1F3825);
    letter-spacing: 1px;
    margin: 0;
  }

  .main-lead {
    font-size: 1.05rem;
    color: var(--journal-ink, #1B2B1F);
    max-width: 440px;
    line-height: 1.45;
    margin: 0;
  }

  .start-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    width: 100%;
  }

  .play-btn {
    background-color: var(--journal-gold, #E5A93C);
    color: var(--journal-ink, #1B2B1F);
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: 1px;
    padding: 14px 48px;
    border: 3px solid var(--journal-ink, #1B2B1F);
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 0 5px 0 var(--journal-ink, #1B2B1F);
    transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s, background-color 0.15s;
  }

  .play-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 0 var(--journal-ink, #1B2B1F);
    background-color: #F2BA49;
  }

  .play-btn:active {
    transform: translateY(2px);
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
  }

  .secondary-links {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .meta-link {
    background: none;
    border: none;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--journal-ink, #1B2B1F);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: color 0.15s, background-color 0.15s;
  }

  .meta-link:hover {
    color: var(--journal-forest, #1F3825);
    background-color: #EFE9D8;
  }

  .divider {
    color: color-mix(in srgb, var(--journal-ink) 40%, transparent);
  }

  /* Modals */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(18, 26, 20, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }

  .modal-card {
    background-color: var(--journal-paper, #FAF6ED);
    border: 3px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 8px 0 var(--journal-ink, #1B2B1F);
    border-radius: var(--radius-md, 8px);
    max-width: 520px;
    width: 100%;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: popIn 0.2s ease-out;
  }

  .nasa-info-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: color-mix(in srgb, var(--journal-paper, #FAF6ED) 90%, var(--journal-ink, #1B2B1F));
    border: 1.5px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 12px;
  }

  .section-badge {
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--journal-forest, #1F3825);
  }

  .nasa-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .nasa-item {
    display: flex;
    flex-direction: column;
    font-size: 0.78rem;
    line-height: 1.35;
    background: var(--journal-paper, #FAF6ED);
    border: 1px solid var(--journal-ink, #1B2B1F);
    border-radius: 4px;
    padding: 6px 8px;
  }

  .nasa-item strong {
    color: var(--journal-forest, #1F3825);
    font-size: 0.8rem;
  }

  .limits-box {
    font-size: 0.78rem;
    line-height: 1.35;
    border-top: 1px dashed var(--journal-ink, #1B2B1F);
    padding-top: 8px;
    color: var(--journal-soil, #7C4A2D);
  }

  .limits-box ol {
    margin: 4px 0 0 16px;
    padding: 0;
  }

  @keyframes popIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--journal-ink, #1B2B1F);
    padding-bottom: 10px;
  }

  .modal-title {
    font-size: 1.4rem;
    color: var(--journal-forest, #1F3825);
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--journal-ink, #1B2B1F);
  }

  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--journal-ink, #1B2B1F);
  }

  .callout-box {
    background-color: color-mix(in srgb, var(--journal-gold, #E5A93C) 18%, #FAF6ED);
    border-left: 3px solid var(--journal-gold, #E5A93C);
    padding: 10px 14px;
    border-radius: 4px;
    font-size: 0.88rem;
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px dashed color-mix(in srgb, var(--journal-ink) 25%, transparent);
  }

  .setting-label {
    font-weight: 700;
  }

  .setting-hint {
    font-size: 0.8rem;
    color: color-mix(in srgb, var(--journal-ink) 70%, transparent);
  }

  .toggle-btn {
    padding: 6px 14px;
    border-radius: 999px;
    border: 2px solid var(--journal-ink, #1B2B1F);
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    background-color: var(--journal-paper, #FAF6ED);
  }

  .toggle-btn.active {
    background-color: var(--journal-gold, #E5A93C);
  }

  .theme-badge {
    background-color: var(--journal-forest, #1F3825);
    color: var(--journal-paper, #FAF6ED);
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.78rem;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 4px;
  }
</style>
