<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'paddy' | 'chili' | 'forest';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    children?: Snippet;
  }

  let { 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    onclick, 
    type = 'button',
    class: className = '',
    children 
  }: Props = $props();
</script>

<button 
  {type}
  class="vintage-btn btn-{variant} size-{size} {className}" 
  {disabled}
  {onclick}
>
  {@render children?.()}
</button>

<style>
  .vintage-btn {
    font-family: var(--font-body, system-ui, sans-serif);
    font-weight: 600;
    border: var(--border-ink, 2.5px solid #1B2B1F);
    border-radius: 9999px;
    box-shadow: 0 4px 0 #1B2B1F;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    line-height: 1.2;
    letter-spacing: 0.02em;
    transition: transform 120ms cubic-bezier(.34, 1.56, .64, 1), box-shadow 120ms cubic-bezier(.34, 1.56, .64, 1), background-color 120ms ease;
  }

  .size-sm {
    padding: 0.4em 0.9em;
    font-size: 0.85rem;
  }

  .size-md {
    padding: 0.6em 1.35em;
    font-size: 1rem;
  }

  .size-lg {
    padding: 0.75em 1.8em;
    font-size: 1.15rem;
  }

  .btn-primary {
    background-color: var(--journal-gold, #E5A93C);
    color: var(--journal-ink, #1B2B1F);
  }
  .btn-primary:hover:not(:disabled) {
    background-color: #F0B54B;
  }

  .btn-secondary {
    background-color: var(--journal-paper, #F9F6EE);
    color: var(--journal-ink, #1B2B1F);
  }
  .btn-secondary:hover:not(:disabled) {
    background-color: #EDE5D2;
  }

  .btn-paddy {
    background-color: var(--journal-sage, #3F8A52);
    color: #FFFFFF;
  }
  .btn-paddy:hover:not(:disabled) {
    background-color: #4BA262;
  }

  .btn-forest {
    background-color: var(--journal-forest, #1F3825);
    color: #FFFFFF;
  }
  .btn-forest:hover:not(:disabled) {
    background-color: #2D4E35;
  }

  .btn-chili {
    background-color: var(--journal-madder, #B83827);
    color: #FFFFFF;
  }
  .btn-chili:hover:not(:disabled) {
    background-color: #CE4230;
  }

  .vintage-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #1B2B1F;
  }

  .vintage-btn:active:not(:disabled) {
    transform: translateY(3px);
    box-shadow: 0 1px 0 #1B2B1F;
  }

  .vintage-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: 0 2px 0 #1B2B1F;
    transform: none;
  }
</style>
