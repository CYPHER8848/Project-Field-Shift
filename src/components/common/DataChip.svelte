<script lang="ts">
  import type { SatelliteNote } from '../../types/game';

  interface Props {
    note: SatelliteNote;
    value?: string;
  }

  let { note, value }: Props = $props();
  let showPopover = $state(false);

  function togglePopover(e: MouseEvent) {
    e.stopPropagation();
    showPopover = !showPopover;
  }

  function closePopover() {
    showPopover = false;
  }
</script>

<span class="chip-container">
  <button 
    type="button" 
    class="data-chip font-data" 
    onclick={togglePopover}
    title="Click to view NASA Satellite Note"
    aria-expanded={showPopover}
  >
    <span class="satellite-icon">🛰️</span>
    <span class="tag-name">[{note.dataset}]</span>
    {#if value}
      <span class="val">{value}</span>
    {/if}
  </button>

  {#if showPopover}
    <div class="popover-backdrop" onclick={closePopover} role="presentation"></div>
    <div class="satellite-note-card" role="dialog" aria-modal="true">
      <div class="note-header">
        <span class="badge font-data">NASA {note.dataset} DATA</span>
        <button class="close-btn" onclick={closePopover} aria-label="Close note">✕</button>
      </div>
      
      <h4 class="note-title font-display">{note.title}</h4>
      <div class="sensor-tag font-data">Sensor: {note.sensor}</div>

      <div class="plain-box">
        <div class="box-label font-display">Farmer's Version</div>
        <p class="farmer-text font-body">{note.farmerExplanation}</p>
      </div>

      <div class="science-box">
        <div class="box-label font-data">Scientific Measurement</div>
        <p class="science-text font-data">{note.scientificValue}</p>
      </div>
    </div>
  {/if}
</span>

<style>
  .chip-container {
    position: relative;
    display: inline-block;
  }

  .data-chip {
    font-family: var(--font-data, monospace);
    font-size: 0.74rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background-color: var(--journal-monsoon, #2B69A3);
    color: #FFFFFF;
    border: 1.5px solid var(--journal-border, #1B2B1F);
    border-radius: var(--radius-sm, 6px);
    padding: 2px 7px;
    box-shadow: 0 2px 0 var(--journal-border, #1B2B1F);
    cursor: pointer;
    line-height: 1.2;
    transition: transform 120ms ease, box-shadow 120ms ease;
  }

  .data-chip:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 0 var(--journal-border, #1B2B1F);
    background-color: #3578B8;
  }

  .data-chip:active {
    transform: translateY(1px);
    box-shadow: 0 1px 0 var(--journal-border, #1B2B1F);
  }

  .satellite-icon {
    font-size: 0.78rem;
  }

  .val {
    background-color: rgba(255, 255, 255, 0.25);
    padding: 0 4px;
    border-radius: 3px;
  }

  .popover-backdrop {
    position: fixed;
    inset: 0;
    z-index: 99;
  }

  .satellite-note-card {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    background-color: var(--journal-paper, #F9F6EE);
    color: var(--journal-ink, #1B2B1F);
    border: 2.5px solid var(--journal-border, #1B2B1F);
    border-radius: var(--radius-md, 10px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25), 0 4px 0 var(--journal-border, #1B2B1F);
    padding: 14px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: left;
    animation: popover-in 180ms cubic-bezier(.34, 1.56, .64, 1);
  }

  @keyframes popover-in {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(8px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  .note-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid rgba(27, 43, 31, 0.2);
    padding-bottom: 6px;
  }

  .badge {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--journal-monsoon, #2B69A3);
    letter-spacing: 0.5px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 0.9rem;
    cursor: pointer;
    color: var(--journal-ink, #1B2B1F);
    padding: 2px 6px;
    line-height: 1;
  }

  .note-title {
    font-size: 1.05rem;
    margin: 0;
    color: var(--journal-ink, #1B2B1F);
  }

  .sensor-tag {
    font-size: 0.72rem;
    color: var(--journal-soil, #7E4A35);
  }

  .plain-box {
    background-color: #EDF5FA;
    border-left: 3px solid var(--journal-monsoon, #2B69A3);
    padding: 6px 10px;
    border-radius: 2px;
  }

  .science-box {
    background-color: #FAF4E6;
    border-left: 3px solid var(--journal-gold, #E5A93C);
    padding: 6px 10px;
    border-radius: 2px;
  }

  .box-label {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--journal-ink-muted, #556E5C);
    margin-bottom: 2px;
  }

  .farmer-text {
    font-size: 0.82rem;
    line-height: 1.35;
    color: var(--journal-ink, #1B2B1F);
    margin: 0;
  }

  .science-text {
    font-size: 0.74rem;
    line-height: 1.35;
    color: var(--journal-ink-soft, #2D4233);
    margin: 0;
  }
</style>
