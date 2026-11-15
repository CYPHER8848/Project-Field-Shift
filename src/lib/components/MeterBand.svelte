<script lang="ts">
  interface Props {
    label: string;
    unit: string;
    /** p50 (most likely) value at the selected horizon. */
    value: number;
    /** p10 (low) band edge. */
    lo: number;
    /** p90 (high) band edge. */
    hi: number;
    min: number;
    max: number;
    digits: number;
  }
  let { label, unit, value, lo, hi, min, max, digits }: Props = $props();

  const span = $derived(Math.max(max - min, 1e-9));
  const p = (v: number) => Math.min(100, Math.max(0, ((v - min) / span) * 100));
  /** The shipped sim example marks the less favorable end p10 for directional meters
   *  (erosion risk, water use), so p10 may exceed p90 numerically. Render the interval. */
  const bandLo = $derived(Math.min(lo, hi));
  const bandHi = $derived(Math.max(lo, hi));
  const bandLeft = $derived(p(bandLo));
  const bandWidth = $derived(Math.max(p(bandHi) - p(bandLo), 1.5));
  const pinLeft = $derived(p(value));
  const fv = $derived(value.toFixed(digits));
  const flo = $derived(Math.min(lo, hi).toFixed(digits));
  const fhi = $derived(Math.max(lo, hi).toFixed(digits));
</script>

<div class="meter">
  <span class="meter-label">{label}</span>
  <span class="meter-track" role="img" aria-label="{label}: most likely {fv}, range {flo} to {fhi}">
    <span class="meter-band" style:left="{bandLeft}%" style:width="{bandWidth}%"></span>
    <span class="meter-pin" style:left="{pinLeft}%"></span>
  </span>
  <span class="meter-value">{fv}<small>{unit}</small></span>
</div>
