<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    tilt?: number; // degrees, e.g. -1 to 1
    hasTape?: boolean;
    tapeColor?: string;
    class?: string;
    children?: Snippet;
  }

  let { 
    tilt = 0, 
    hasTape = true, 
    tapeColor = 'rgba(235, 226, 203, 0.9)', 
    class: className = '',
    children 
  }: Props = $props();
</script>

<div 
  class="sticker-card {className} {hasTape ? 'with-tape' : ''}" 
  style:--card-tilt="{tilt}deg"
  style:--custom-tape-color={tapeColor}
>
  {#if hasTape}
    <div class="tape-strip" aria-hidden="true"></div>
  {/if}
  <div class="card-inner">
    {@render children?.()}
  </div>
</div>

<style>
  .sticker-card {
    background-color: var(--journal-paper, #FAF7F0);
    color: var(--journal-ink, #1B2B1F);
    border: var(--border-ink, 2.5px solid #1B2B1F);
    border-radius: var(--radius-md, 10px);
    box-shadow: var(--shadow-pressable, 0 5px 0 #1B2B1F);
    transform: rotate(var(--card-tilt, 0deg));
    position: relative;
    padding: 20px;
    transition: transform var(--fast, 130ms) var(--spring, ease), box-shadow var(--fast, 130ms) var(--spring, ease);
  }

  .sticker-card:hover {
    box-shadow: 0 8px 24px rgba(27, 43, 31, 0.14), 0 5px 0 var(--journal-border, #1B2B1F);
    transform: rotate(var(--card-tilt, 0deg)) translateY(-2px);
  }

  .tape-strip {
    position: absolute;
    top: -10px;
    left: 24px;
    width: 64px;
    height: 20px;
    background-color: var(--custom-tape-color);
    border: 1px solid rgba(80, 60, 40, 0.35);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    transform: rotate(-2.5deg);
    pointer-events: none;
    z-index: 5;
    border-radius: 1px;
  }

  .card-inner {
    position: relative;
    z-index: 1;
    width: 100%;
  }
</style>
