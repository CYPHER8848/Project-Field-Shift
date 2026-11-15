<script lang="ts">
  interface Props {
    text: string;
    sublabel?: string;
  }

  let { text, sublabel = "Amma's Wisdom" }: Props = $props();
</script>

<div class="amma-bubble-wrapper">
  <div class="amma-avatar-badge font-display" aria-hidden="true">
    👵🏾
  </div>
  <div class="speech-bubble">
    <div class="bubble-header font-display">{sublabel}</div>
    <p class="bubble-text font-body">{text}</p>
    <div class="pointer-tail" aria-hidden="true"></div>
  </div>
</div>

<style>
  .amma-bubble-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    max-width: 720px;
    margin: 0 auto;
    position: relative;
    width: 100%;
  }

  .amma-avatar-badge {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--journal-forest, #1F3825);
    color: #FFFFFF;
    border: 2.5px solid var(--journal-border, #1B2B1F);
    box-shadow: 0 4px 0 var(--journal-border, #1B2B1F);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    flex-shrink: 0;
  }

  .speech-bubble {
    position: relative;
    background-color: #FAF4E6;
    border: 2.5px solid var(--journal-border, #1B2B1F);
    border-radius: var(--radius-md, 10px);
    padding: 12px 18px;
    box-shadow: 0 4px 0 var(--journal-border, #1B2B1F);
    flex-grow: 1;
  }

  .bubble-header {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--journal-soil, #7E4A35);
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .bubble-text {
    font-size: 1rem;
    font-style: italic;
    line-height: 1.5;
    color: var(--journal-ink, #1B2B1F);
  }

  .pointer-tail {
    position: absolute;
    top: 14px;
    left: -12px;
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 12px solid var(--journal-border, #1B2B1F);
  }

  .pointer-tail::after {
    content: "";
    position: absolute;
    top: -6px;
    left: 2px;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 10px solid #FAF4E6;
  }
</style>
