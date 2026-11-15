<script lang="ts">
  import Button from '../common/Button.svelte';
  import BlockPrintBorder from '../common/BlockPrintBorder.svelte';

  interface Props {
    onSelectOverworld: () => void;
    onSelectStorymode: () => void;
    onBack: () => void;
  }

  let { onSelectOverworld, onSelectStorymode, onBack }: Props = $props();
</script>

<div class="playmode-screen-container">
  <div class="playmode-card">
    <div class="card-header">
      <h1 class="screen-title font-display">CHOOSE PLAYMODE</h1>
      <p class="screen-desc font-body">Select how you would like to experience Amma's farm.</p>
    </div>

    <BlockPrintBorder height={12} variant="phulkari" />

    <div class="mode-options-grid">
      <!-- Option 1: Overworld -->
      <button type="button" class="mode-card overworld-card" onclick={onSelectOverworld}>
        <div class="mode-icon-circle" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--journal-forest, #1F3825)">
            <rect x="2" y="6" width="20" height="12" rx="4" fill="none" stroke="currentColor" stroke-width="2" />
            <line x1="6" y1="12" x2="10" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <line x1="8" y1="10" x2="8" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <circle cx="16" cy="10" r="1.2" fill="currentColor" />
            <circle cx="18" cy="13" r="1.2" fill="currentColor" />
          </svg>
        </div>
        <h2 class="mode-title font-display">Overworld</h2>
        <p class="mode-details font-body">
          Explore Amma's farm in a 2D RPG world. Walk through crop rows, inspect tubewells, and talk to village neighbors.
        </p>
        <div class="mode-action-pill font-data">
          Enter Overworld →
        </div>
      </button>

      <!-- Option 2: Story Mode -->
      <button type="button" class="mode-card story-card" onclick={onSelectStorymode}>
        <div class="mode-icon-circle" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--journal-forest, #1F3825)">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" fill="none" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" fill="none" />
            <line x1="8" y1="7" x2="16" y2="7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </div>
        <h2 class="mode-title font-display">Story Mode</h2>
        <p class="mode-details font-body">
          Experience Amma's generational story from 1990 to 2040. Walk through family memory, live debate, and future legacy.
        </p>
        <div class="mode-action-pill font-data highlight">
          Start Story Mode →
        </div>
      </button>
    </div>

    <div class="footer-actions">
      <Button variant="secondary" size="md" onclick={onBack}>
        ← Back to Start
      </Button>
    </div>
  </div>
</div>

<style>
  .playmode-screen-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 60px);
    padding: 32px 16px;
    background: radial-gradient(circle at center, #1E3324 0%, #111A13 100%);
  }

  .playmode-card {
    max-width: 820px;
    width: 100%;
    background-color: var(--journal-paper, #FAF6ED);
    border: 3px solid var(--journal-ink, #1B2B1F);
    box-shadow: 0 8px 0 var(--journal-ink, #1B2B1F);
    border-radius: var(--radius-md, 8px);
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .card-header {
    text-align: center;
  }

  .screen-title {
    font-size: 2.2rem;
    color: var(--journal-forest, #1F3825);
    margin: 0 0 6px 0;
    letter-spacing: 0.5px;
  }

  .screen-desc {
    font-size: 1rem;
    color: var(--journal-ink, #1B2B1F);
    margin: 0;
  }

  .mode-options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
  }

  .mode-card {
    background-color: #FFFFFF;
    border: 2.5px solid var(--journal-ink, #1B2B1F);
    border-radius: var(--radius-md, 8px);
    box-shadow: 0 4px 0 var(--journal-ink, #1B2B1F);
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    cursor: pointer;
    transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s, background-color 0.15s;
  }

  .mode-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 0 var(--journal-ink, #1B2B1F);
    background-color: #FAF6F0;
  }

  .mode-icon-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: var(--journal-paper, #FAF6ED);
    border: 2px solid var(--journal-ink, #1B2B1F);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
  }

  .mode-title {
    font-size: 1.45rem;
    color: var(--journal-forest, #1F3825);
    margin: 0;
  }

  .mode-details {
    font-size: 0.92rem;
    line-height: 1.45;
    color: var(--journal-ink, #1B2B1F);
    margin: 0;
    flex-grow: 1;
  }

  .mode-action-pill {
    margin-top: 8px;
    padding: 8px 18px;
    border-radius: 999px;
    border: 2px solid var(--journal-ink, #1B2B1F);
    background-color: var(--journal-paper, #FAF6ED);
    color: var(--journal-ink, #1B2B1F);
    font-size: 0.8rem;
    font-weight: 700;
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
  }

  .mode-action-pill.highlight {
    background-color: var(--journal-gold, #E5A93C);
  }

  .footer-actions {
    display: flex;
    justify-content: flex-start;
    margin-top: 6px;
  }
</style>
