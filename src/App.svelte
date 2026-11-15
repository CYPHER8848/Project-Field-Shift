<script lang="ts">
  import MeterBand from './lib/components/MeterBand.svelte';
  import WeatherStrip from './lib/components/WeatherStrip.svelte';
  import {
    METERS,
    REGIONS,
    crops,
    horizons,
    meterExtents,
    metersAt,
    regionById,
    sims,
    weatherFor
  } from './lib/data';
  import type { StrategyId } from '../contracts/sim-output';

  type Scene = 'intro' | 'region' | 'season' | 'compare' | 'reflect';
  const scenes: { id: Scene; label: string }[] = [
    { id: 'intro', label: 'The inheritance' }, { id: 'region', label: 'Choose a region' },
    { id: 'season', label: 'A changing season' }, { id: 'compare', label: 'Compare paths' },
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
  const weather = $derived(weatherFor(regionId));
</script>
<svelte:head><title>Field Shift — Four Seasons of Amma's Field</title></svelte:head>
<main class="shell">
  <header class="topbar"><a class="wordmark" href="#intro" onclick={() => active = 'intro'}>FIELD SHIFT</a><span class="eyebrow">A farm, across generations</span></header>
  <nav aria-label="Game scenes" class="scene-nav">{#each scenes as scene}<button class:current={active === scene.id} onclick={() => active = scene.id}>{scene.label}</button>{/each}</nav>
  {#if active === 'intro'}
    <section class="hero"><p class="eyebrow">FOUR SEASONS OF AMMA'S FIELD</p><h1>Every season leaves<br />something behind.</h1><p class="lead">A family farm. A changing climate. Decisions that echo beyond one harvest.</p><button class="primary" onclick={next}>Begin the story</button></section>
  {:else if active === 'region'}
    <section class="panel"><p class="eyebrow">CHAPTER 01 · PLACE</p><h1>Where does your story begin?</h1><label for="region">Choose a demonstration region</label><select id="region" bind:value={regionId}>{#each REGIONS as r}<option value={r.id}>{r.label}</option>{/each}</select><p class="muted">Demonstration context only, not a farm-specific diagnosis.</p><button class="primary" onclick={next}>Continue</button></section>
  {:else if active === 'season'}
    <section class="panel">
      <p class="eyebrow">CHAPTER 02 · THE FIELD</p><h1>{region.label}</h1>
      <div class="field-art" role="img" aria-label="Illustrative farm plot with rows of crops"><svg viewBox="0 0 720 260" aria-hidden="true"><rect width="720" height="260" fill={region.sky} /><path d="M0 140 Q180 95 360 140 T720 130 V260 H0Z" fill={region.soil} />{#each [0,1,2,3,4,5] as n}<path d={'M' + (60+n*110) + ' 260 Q' + (90+n*105) + ' 185 ' + (120+n*100) + ' 135'} stroke={region.furrow} stroke-width="16" fill="none" /><path d={'M' + (60+n*110) + ' 210 l-18 -25 m18 25 l22 -30'} stroke={region.crop} stroke-width="7" stroke-linecap="round" />{/each}<circle cx="590" cy="55" r="27" fill={region.sun} /></svg></div>
      {#if weather}
        <WeatherStrip records={weather} />
      {:else}
        <p class="muted">No weekly weather dataset loaded for {region.label} yet — Punjab is the current demonstration dataset.</p>
      {/if}
      <h2 class="subhead">The field's crop calendar <span class="muted">(shared catalogue · synthetic placeholder values)</span></h2>
      <ul class="crop-list">
        {#each crops as c (c.id)}
          <li><strong>{c.name}</strong><span>water use {c.waterUse} mm/season</span><span>roots {c.rootingDepth} cm</span><span>{c.nitrogenFixation ? 'fixes nitrogen' : 'no N fixation'}</span><span>cover {c.coverValue.toFixed(2)}</span><span class="tag">{c.season.join(' / ')}</span></li>
        {/each}
      </ul>
      <p class="muted">Illustrative scene only. Environmental indicators will be connected in later phases.</p>
      <button class="primary" onclick={next}>See the possible paths</button>
    </section>
  {:else if active === 'compare'}
    <section class="panel">
      <p class="eyebrow">CHAPTER 03 · CHOICES</p><h1>There is more than one way forward.</h1>
      <div class="horizon-toggle" role="group" aria-label="Horizon year">{#each horizons as y}<button class:current={horizon === y} onclick={() => horizon = y}>{y}</button>{/each}</div>
      <div class="cards">
        {#each strategyCards as card (card.id)}
          {@const sim = sims[card.id]}
          {@const meters = metersAt(card.id, horizon)}
          <article class="strat">
            <h2>{card.title}</h2><p>{card.blurb}</p>
            <div class="meters">
              {#each METERS as m (m.key)}
                <MeterBand
                  label={m.label}
                  unit={m.unit}
                  digits={m.digits}
                  value={meters[m.key]}
                  lo={sim.p10[m.key]}
                  hi={sim.p90[m.key]}
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
    <section class="panel"><p class="eyebrow">EPILOGUE · STEWARDSHIP</p><h1>The data can show a pattern.<br />The farmer knows the field.</h1><p class="lead">Field Shift is designed to support farmers and local experts, not replace their judgement.</p><button class="primary" onclick={() => active = 'intro'}>Begin again</button></section>
  {/if}
  <footer>NASA Earth observation data · Decision support, not a yield forecast</footer>
</main>
