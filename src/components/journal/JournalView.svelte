<script lang="ts">
  import MeterBand from '../../lib/components/MeterBand.svelte';
  import WeatherStrip from '../../lib/components/WeatherStrip.svelte';
  import {
    METERS,
    REGIONS,
    crops,
    getMeterBand,
    horizons,
    meterExtents,
    metersAt,
    regionById,
    sims
  } from '../../lib/data';
  import { latestFullYear, loadRegionWeather } from '../../lib/regionalWeather';
  import type { RegionalWeather } from '../../../contracts/weather';
  import type { StrategyId } from '../../../contracts/sim-output';

  type Scene = 'intro' | 'region' | 'season' | 'compare' | 'reflect';
  const scenes: { id: Scene; label: string }[] = [
    { id: 'intro', label: 'The inheritance' },
    { id: 'region', label: 'Choose a region' },
    { id: 'season', label: 'A changing season' },
    { id: 'compare', label: 'Compare paths' },
    { id: 'reflect', label: 'What we leave behind' }
  ];

  const strategyCards: { id: StrategyId; title: string; blurb: string }[] = [
    { id: 'existing_rotation', title: 'Keep the rhythm', blurb: 'Continue the existing rotation. A baseline for comparison, not a recommendation.' },
    { id: 'resilience_rotation', title: 'Build resilience', blurb: 'Explore a rotation that prioritises soil cover and water resilience.' },
    { id: 'income_rotation', title: 'Protect income', blurb: 'Explore a rotation that places greater weight on near-term farm income.' }
  ];

  let active: Scene = $state('intro');
  let regionId = $state('punjab');
  let horizon: number = $state(2040);

  function next() {
    const index = scenes.findIndex((scene) => scene.id === active);
    active = scenes[Math.min(index + 1, scenes.length - 1)].id;
  }

  const region = $derived(regionById(regionId));

  // Lazy per-region weather: only the viewed region's chunk is downloaded.
  let weatherRecords = $state<RegionalWeather | null>(null);
  let weatherState = $state<'loading' | 'ready' | 'missing'>('loading');
  let weatherRequest = 0;

  $effect(() => {
    const id = regionId;
    const token = ++weatherRequest;
    weatherState = 'loading';
    loadRegionWeather(id)
      .then((records) => {
        if (token !== weatherRequest) return;
        weatherRecords = records ? latestFullYear(records) : null;
        weatherState = records ? 'ready' : 'missing';
      })
      .catch(() => {
        if (token !== weatherRequest) return;
        weatherRecords = null;
        weatherState = 'missing';
      });
  });
</script>

<div class="journal-wrapper">
  <main class="shell">
    <header class="topbar">
      <span class="wordmark">FIELD SHIFT JOURNAL</span>
      <span class="eyebrow">A farm, across generations</span>
    </header>
    <nav aria-label="Game scenes" class="scene-nav">
      {#each scenes as scene}
        <button class:current={active === scene.id} onclick={() => active = scene.id}>
          {scene.label}
        </button>
      {/each}
    </nav>
    {#if active === 'intro'}
      <section class="hero">
        <p class="eyebrow">FOUR SEASONS OF AMMA'S FIELD</p>
        <h1>Every season leaves<br />something behind.</h1>
        <p class="lead">A family farm. A changing climate. Decisions that echo beyond one harvest.</p>
        <button class="primary" onclick={next}>Begin the story</button>
      </section>
    {:else if active === 'region'}
      <section class="panel">
        <p class="eyebrow">CHAPTER 01 · PLACE</p>
        <h1>Where does your story begin?</h1>
        <label for="region-select">Choose a demonstration region</label>
        <select id="region-select" bind:value={regionId}>
          {#each REGIONS as r}
            <option value={r.id}>{r.label}</option>
          {/each}
        </select>
        <p class="muted">Demonstration context only, not a farm-specific diagnosis.</p>
        <button class="primary" onclick={next}>Continue</button>
      </section>
    {:else if active === 'season'}
      <section class="panel">
        <p class="eyebrow">CHAPTER 02 · THE FIELD</p>
        <h1>{region.label}</h1>
        <div class="field-art" role="img" aria-label="Illustrative farm plot with rows of crops">
          <svg viewBox="0 0 720 260" aria-hidden="true">
            <rect width="720" height="260" fill={region.sky} />
            <path d="M0 140 Q180 95 360 140 T720 130 V260 H0Z" fill={region.soil} />
            {#each [0,1,2,3,4,5] as n}
              <path d={'M' + (60+n*110) + ' 260 Q' + (90+n*105) + ' 185 ' + (120+n*100) + ' 135'} stroke={region.furrow} stroke-width="16" fill="none" />
              <path d={'M' + (60+n*110) + ' 210 l-18 -25 m18 25 l22 -30'} stroke={region.crop} stroke-width="7" stroke-linecap="round" />
            {/each}
            <circle cx="590" cy="55" r="27" fill={region.sun} />
          </svg>
        </div>
        {#if weatherState === 'ready' && weatherRecords}
          <WeatherStrip records={weatherRecords} source="NASA POWER · precomputed" />
        {:else if weatherState === 'loading'}
          <p class="muted">Loading weekly weather…</p>
        {:else}
          <p class="muted">Weather dataset unavailable for {region.label}.</p>
        {/if}
        <h2 class="subhead">The field's crop calendar <span class="muted">(curated catalogue · cited sources in the data file)</span></h2>
        <ul class="crop-list">
          {#each crops as c (c.id)}
            <li>
              <strong>{c.name}</strong>
              <span>water use {c.waterUse} mm/season</span>
              <span>roots {c.rootingDepth} cm</span>
              <span>{c.nitrogenFixation ? 'fixes nitrogen' : 'no N fixation'}</span>
              <span>cover {c.coverValue.toFixed(2)}</span>
              <span class="tag">{c.season.join(' / ')}</span>
            </li>
          {/each}
        </ul>
        <p class="muted">Illustrative scene only. Environmental indicators will be connected in later phases.</p>
        <button class="primary" onclick={next}>See the possible paths</button>
      </section>
    {:else if active === 'compare'}
      <section class="panel">
        <p class="eyebrow">CHAPTER 03 · CHOICES</p>
        <h1>There is more than one way forward.</h1>
        <div class="horizon-toggle" role="group" aria-label="Horizon year">
          {#each horizons as y}
            <button class:current={horizon === y} onclick={() => horizon = y}>{y}</button>
          {/each}
        </div>
        <div class="cards">
          {#each strategyCards as card (card.id)}
            {@const sim = sims[card.id]}
            {@const meters = metersAt(card.id, horizon)}
            <article class="strat">
              <h2>{card.title}</h2>
              <p>{card.blurb}</p>
              <div class="meters">
                {#each METERS as m (m.key)}
                  {@const band = getMeterBand(sim, m.key)}
                  <MeterBand
                    label={m.label}
                    unit={m.unit}
                    digits={m.digits}
                    value={meters[m.key]}
                    lo={band.lo}
                    hi={band.hi}
                    min={meterExtents[m.key].min}
                    max={meterExtents[m.key].max}
                  />
                {/each}
              </div>
            </article>
          {/each}
        </div>
        <p class="muted">Bars show the p10–p90 range with the most likely value pinned; scales are shared across strategies for comparison. Strategy results are synthetic placeholders until the simulation and evidence pipeline are implemented, and meter units are provisional.</p>
        <button class="primary" onclick={next}>Reflect</button>
      </section>
    {:else}
      <section class="panel">
        <p class="eyebrow">EPILOGUE · STEWARDSHIP</p>
        <h1>The data can show a pattern.<br />The farmer knows the field.</h1>
        <p class="lead">Field Shift is designed to support farmers and local experts, not replace their judgement.</p>
        <button class="primary" onclick={() => active = 'intro'}>Begin again</button>
      </section>
    {/if}
    <footer>NASA Earth observation data · Decision support, not a yield forecast</footer>
  </main>
</div>

<style>
  .journal-wrapper {
    background-color: #24372B;
    color: #ECEADE;
    min-height: calc(100vh - 56px);
    padding: 24px 16px;

    /* Theme bridge for shared components (MeterBand / WeatherStrip). */
    --meter-track-bg: rgba(236, 234, 222, 0.16);
    --meter-band-bg: #B3C7A4;
    --meter-pin-bg: #ECEADE;
    --meter-label-color: #B3C7A4;
    --meter-value-color: #ECEADE;
    --meter-unit-color: #788064;
    --weather-bg: #1A281E;
    --weather-border-color: #788064;
    --weather-axis-color: #788064;
    --weather-legend-color: #B3C7A4;
  }
  .shell {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1px solid #788064;
    padding-bottom: 12px;
  }
  .wordmark {
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #ECEADE;
  }
  .eyebrow {
    font-size: 0.75rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #B3C7A4;
  }
  .scene-nav {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .scene-nav button {
    background: transparent;
    border: 1px solid #788064;
    color: #ECEADE;
    padding: 6px 14px;
    border-radius: 999px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .scene-nav button.current {
    background-color: #B3C7A4;
    color: #24372B;
    border-color: #B3C7A4;
    font-weight: 600;
  }
  .hero, .panel {
    background-color: rgba(36, 55, 43, 0.85);
    border: 1px solid #788064;
    border-radius: 8px;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  h1 {
    font-size: 1.8rem;
    line-height: 1.25;
    color: #ECEADE;
  }
  .lead {
    font-size: 1.05rem;
    color: #B3C7A4;
    max-width: 600px;
  }
  .muted {
    font-size: 0.85rem;
    color: #788064;
  }
  button.primary {
    align-self: flex-start;
    background-color: #B3C7A4;
    color: #24372B;
    border: none;
    padding: 10px 22px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.95rem;
  }
  button.primary:hover {
    background-color: #d1dfc9;
  }
  select {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #788064;
    background-color: #1A281E;
    color: #ECEADE;
    font-size: 0.95rem;
    max-width: 320px;
  }
  .field-art {
    width: 100%;
    max-width: 720px;
    margin: 18px 0;
    border-radius: 8px;
    overflow: hidden;
  }
  .field-art svg {
    display: block;
    width: 100%;
    max-height: 200px;
    border-radius: 6px;
  }
  .subhead {
    font-size: 1.1rem;
    margin-top: 12px;
  }
  .crop-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .crop-list li {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    background: rgba(0, 0, 0, 0.2);
    padding: 8px 14px;
    border-radius: 4px;
    font-size: 0.85rem;
  }
  .crop-list .tag {
    background-color: #788064;
    color: #ECEADE;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
  }
  .horizon-toggle {
    display: flex;
    gap: 8px;
  }
  .horizon-toggle button {
    background: transparent;
    border: 1px solid #788064;
    color: #ECEADE;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  .horizon-toggle button.current {
    background-color: #B3C7A4;
    color: #24372B;
    font-weight: 600;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }
  .strat {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #788064;
    border-radius: 6px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .strat h2 {
    font-size: 1.15rem;
  }
  .meters {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  footer {
    text-align: center;
    font-size: 0.75rem;
    color: #788064;
    padding: 16px 0;
  }
</style>
