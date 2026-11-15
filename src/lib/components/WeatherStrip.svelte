<script lang="ts">
  import type { RegionalWeather } from '../../../contracts/weather';

  interface Props {
    records: RegionalWeather;
  }
  let { records }: Props = $props();

  const W = 720;
  const BASE = 118;

  const n = $derived(Math.max(records.length, 1));
  const step = $derived(W / n);
  const barW = $derived(Math.min(step * 0.64, 46));
  const rainMax = $derived(Math.max(1, ...records.map((r) => r.rain ?? 0), 15));
  const temps = $derived(records.flatMap((r) => [r.tmax, r.tmin]).filter((t): t is number => t != null));
  const tMin = $derived(temps.length ? Math.min(...temps) : 0);
  const tSpan = $derived(temps.length ? Math.max(Math.max(...temps) - tMin, 1) : 1);
  const yTemp = (t: number) => 10 + (1 - (t - tMin) / tSpan) * 52;
  const yWet = (v: number) => 78 + (1 - Math.max(0, Math.min(1, v))) * 26;
</script>

<figure class="weather">
  <svg
    viewBox="0 0 720 150"
    role="img"
    aria-label="Illustrative weekly weather strip from synthetic mock data: rain bars, temperature range lines, and soil wetness dots."
  >
    <line x1="0" x2={W} y1={BASE} y2={BASE} stroke="#d8d5ca" />
    {#each records as r, i (r.year + '-' + r.week)}
      {@const x = step * (i + 0.5)}
      {#if r.rain != null && r.rain > 0}
        {@const h = (r.rain / rainMax) * 50}
        <rect x={x - barW / 2} width={barW} y={BASE - h} height={h} fill="#5b7fa6" rx="2" opacity="0.85" />
      {/if}
      {#if r.tmax != null && r.tmin != null}
        <line x1={x} x2={x} y1={yTemp(r.tmax)} y2={yTemp(r.tmin)} stroke="#b65d3d" stroke-width="3" stroke-linecap="round" />
      {/if}
      {#if r.soilWet != null}
        <circle cx={x} cy={yWet(r.soilWet)} r="3.5" fill="#486c42" />
      {/if}
    {/each}
  </svg>
  <figcaption class="legend">
    <span><i class="swatch" style:background="#5b7fa6"></i>Rain (mm/week)</span>
    <span><i class="swatch" style:background="#b65d3d"></i>Temperature range (°C)</span>
    <span><i class="swatch" style:background="#486c42"></i>Soil wetness (fraction)</span>
    <span class="muted">{records.length} of ~52 weeks loaded · synthetic mock · missing observations are left as gaps, never interpolated</span>
  </figcaption>
</figure>
