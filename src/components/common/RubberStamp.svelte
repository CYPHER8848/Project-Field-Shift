<script lang="ts">
  interface Props {
    text?: string;
    subtext?: string;
    angle?: number;
    size?: 'sm' | 'md' | 'lg';
  }

  let { 
    text = "ASK A LOCAL EXPERT", 
    subtext = "Supports, doesn't replace farmers",
    angle = -6,
    size = 'md' 
  }: Props = $props();
</script>

<div 
  class="stamp-wrapper size-{size}"
  style:--stamp-angle="{angle}deg"
>
  <div class="rubber-stamp-box">
    <div class="stamp-inner-border">
      <span class="stamp-main font-display">{text}</span>
      {#if subtext}
        <span class="stamp-sub font-data">{subtext}</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .stamp-wrapper {
    display: inline-block;
    user-select: none;
    transform: rotate(var(--stamp-angle, -6deg));
    animation: stamp-thud 400ms cubic-bezier(.34, 1.56, .64, 1) forwards;
  }

  @keyframes stamp-thud {
    0% {
      transform: scale(1.5) rotate(var(--stamp-angle, -6deg));
      opacity: 0;
    }
    60% {
      transform: scale(0.94) rotate(calc(var(--stamp-angle, -6deg) + 2deg));
      opacity: 1;
    }
    80% {
      transform: scale(1.02) rotate(calc(var(--stamp-angle, -6deg) - 1deg));
    }
    100% {
      transform: scale(1) rotate(var(--stamp-angle, -6deg));
    }
  }

  .rubber-stamp-box {
    border: 3px double var(--journal-madder, #B83827);
    border-radius: 6px;
    padding: 3px;
    background-color: rgba(184, 56, 39, 0.05);
    box-shadow: 0 1px 4px rgba(184, 56, 39, 0.15);
  }

  .stamp-inner-border {
    border: 1.5px dashed var(--journal-madder, #B83827);
    border-radius: 4px;
    padding: 4px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    text-align: center;
  }

  .stamp-main {
    color: var(--journal-madder, #B83827);
    font-size: 0.88rem;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .stamp-sub {
    color: var(--journal-madder, #B83827);
    font-size: 0.62rem;
    letter-spacing: 0.4px;
    opacity: 0.92;
  }

  .size-sm .stamp-main { font-size: 0.76rem; }
  .size-sm .stamp-sub { font-size: 0.55rem; }

  .size-lg .stamp-main { font-size: 1.1rem; }
  .size-lg .stamp-sub { font-size: 0.72rem; }
</style>
