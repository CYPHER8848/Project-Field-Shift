<script lang="ts">
  type Scene = 'intro' | 'region' | 'season' | 'compare' | 'reflect';
  const scenes: { id: Scene; label: string }[] = [
    { id: 'intro', label: 'The inheritance' }, { id: 'region', label: 'Choose a region' },
    { id: 'season', label: 'A changing season' }, { id: 'compare', label: 'Compare paths' },
    { id: 'reflect', label: 'What we leave behind' }
  ];
  let active: Scene = $state('intro');
  let region = $state('Punjab, India');
  function next() {
    const index = scenes.findIndex((scene) => scene.id === active);
    active = scenes[Math.min(index + 1, scenes.length - 1)].id;
  }
</script>
<svelte:head><title>Field Shift — Four Seasons of Amma's Field</title></svelte:head>
<main class="shell">
  <header class="topbar"><a class="wordmark" href="#intro" onclick={() => active = 'intro'}>FIELD SHIFT</a><span class="eyebrow">A farm, across generations</span></header>
  <nav aria-label="Game scenes" class="scene-nav">{#each scenes as scene}<button class:current={active === scene.id} onclick={() => active = scene.id}>{scene.label}</button>{/each}</nav>
  {#if active === 'intro'}
    <section class="hero"><p class="eyebrow">FOUR SEASONS OF AMMA'S FIELD</p><h1>Every season leaves<br />something behind.</h1><p class="lead">A family farm. A changing climate. Decisions that echo beyond one harvest.</p><button class="primary" onclick={next}>Begin the story</button></section>
  {:else if active === 'region'}
    <section class="panel"><p class="eyebrow">CHAPTER 01 · PLACE</p><h1>Where does your story begin?</h1><label for="region">Choose a demonstration region</label><select id="region" bind:value={region}><option>Punjab, India</option><option>Iowa, USA</option><option>Karnataka, India</option><option>Sahel / Kenya (site to be confirmed)</option></select><p class="muted">Demonstration context only, not a farm-specific diagnosis.</p><button class="primary" onclick={next}>Continue</button></section>
  {:else if active === 'season'}
    <section class="panel"><p class="eyebrow">CHAPTER 02 · THE FIELD</p><h1>{region}</h1><div class="field-art" role="img" aria-label="Illustrative farm plot with rows of crops"><svg viewBox="0 0 720 260" aria-hidden="true"><rect width="720" height="260" fill="#dce5c9" /><path d="M0 140 Q180 95 360 140 T720 130 V260 H0Z" fill="#9a815b" />{#each [0,1,2,3,4,5] as n}<path d={'M' + (60+n*110) + ' 260 Q' + (90+n*105) + ' 185 ' + (120+n*100) + ' 135'} stroke="#d4b987" stroke-width="16" fill="none" /><path d={'M' + (60+n*110) + ' 210 l-18 -25 m18 25 l22 -30'} stroke="#486c42" stroke-width="7" stroke-linecap="round" />{/each}<circle cx="590" cy="55" r="27" fill="#e8b95c" /></svg></div><p class="muted">Illustrative scene only. Environmental indicators will be connected in later phases.</p><button class="primary" onclick={next}>See the possible paths</button></section>
  {:else if active === 'compare'}
    <section class="panel"><p class="eyebrow">CHAPTER 03 · CHOICES</p><h1>There is more than one way forward.</h1><div class="cards"><article><h2>Keep the rhythm</h2><p>Continue the existing rotation. A baseline for comparison, not a recommendation.</p></article><article><h2>Build resilience</h2><p>Explore a rotation that prioritises soil cover and water resilience.</p></article><article><h2>Protect income</h2><p>Explore a rotation that places greater weight on near-term farm income.</p></article></div><p class="muted">Strategy results are placeholders until the simulation and evidence pipeline are implemented.</p><button class="primary" onclick={next}>Reflect</button></section>
  {:else}
    <section class="panel"><p class="eyebrow">EPILOGUE · STEWARDSHIP</p><h1>The data can show a pattern.<br />The farmer knows the field.</h1><p class="lead">Field Shift is designed to support farmers and local experts, not replace their judgement.</p><button class="primary" onclick={() => active = 'intro'}>Begin again</button></section>
  {/if}
  <footer>NASA Earth observation data · Decision support, not a yield forecast</footer>
</main>