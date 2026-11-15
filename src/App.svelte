<script lang="ts">
  import type { SceneView, RegionInfo, EraInfo, FarmMeters, StrategyOption } from './types/game';
  import { REGIONS, ERAS } from './data/mockData';
  import IntroScreen from './components/intro/IntroScreen.svelte';
  import RegionSelectScreen from './components/region/RegionSelectScreen.svelte';
  import FarmPlayScreen from './components/game/FarmPlayScreen.svelte';
  import GbaGame from './components/gba/GbaGame.svelte';
  import HariStoryFlow from './components/story/HariStoryFlow.svelte';
  import CompareScreen from './components/compare/CompareScreen.svelte';
  import NasaDataView from './components/nasa/NasaDataView.svelte';
  import StyleguideView from './components/styleguide/StyleguideView.svelte';
  import JournalView from './components/journal/JournalView.svelte';

  // Extended SceneView to include Member C's Field Journal
  type ExtendedSceneView = SceneView | 'JOURNAL';

  // Master State Machine - Starts directly into Hari's Story Game!
  let currentView = $state<ExtendedSceneView>('STORY_GAME');
  let selectedRegion = $state<RegionInfo>(REGIONS.punjab);
  let eraIndex = $state(0);
  const currentEra = $derived(ERAS[eraIndex]);

  // Seasons cycle
  const SEASONS = ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)'];
  let seasonIndex = $state(0);
  const currentSeasonName = $derived(SEASONS[seasonIndex]);

  // Live Farm Meters
  let meters = $state<FarmMeters>({ ...REGIONS.punjab.initialMeters });

  // Play Mode: 'gba' (GBA Pokémon/Zelda style) vs 'almanac' (classic illustrated almanac)
  let playMode = $state<'gba' | 'almanac'>('gba');

  // Weather condition for graphics
  let weatherCondition = $state<'normal' | 'rain' | 'dry' | 'harvest'>('normal');

  // Sound toggle (visual indicator)
  let isMuted = $state(false);

  // Transition to specific view
  function setView(view: ExtendedSceneView) {
    currentView = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Region Selection Handler
  function handleSelectRegion(region: RegionInfo) {
    selectedRegion = region;
    meters = { ...region.initialMeters };
    setView('SEASON_PLAY');
  }

  // Season Progression
  function advanceSeason() {
    seasonIndex = (seasonIndex + 1) % SEASONS.length;
    
    // If completed full year, advance era or cycle
    if (seasonIndex === 0) {
      if (eraIndex < ERAS.length - 1) {
        eraIndex++;
      }
    }

    // Dynamic seasonal adjustments based on weather
    if (seasonIndex === 0) {
      // Monsoon
      weatherCondition = 'rain';
      meters.soilMoisture = Math.min(95, meters.soilMoisture + 35);
      meters.erosionRisk = Math.min(85, meters.erosionRisk + 12);
      meters.waterUse += 120;
    } else if (seasonIndex === 1) {
      // Winter harvest
      weatherCondition = 'harvest';
      meters.soilMoisture = Math.max(25, meters.soilMoisture - 18);
      meters.income += 45;
      meters.organicMatter = Math.min(90, meters.organicMatter + 4);
    } else {
      // Dry Summer
      weatherCondition = 'dry';
      meters.soilMoisture = Math.max(15, meters.soilMoisture - 24);
      meters.erosionRisk = Math.min(90, meters.erosionRisk + 8);
    }
  }

  // Trigger manual weather condition
  function handleTriggerEvent(event: 'rain' | 'dry' | 'harvest' | 'normal') {
    weatherCondition = event;
    if (event === 'rain') {
      meters.soilMoisture = Math.min(100, meters.soilMoisture + 25);
    } else if (event === 'dry') {
      meters.soilMoisture = Math.max(10, meters.soilMoisture - 20);
    } else if (event === 'harvest') {
      meters.income += 30;
      meters.nitrogen = Math.min(100, meters.nitrogen + 10);
    }
  }

  // Strategy Adoption
  function handleSelectStrategy(strat: StrategyOption) {
    meters.soilMoisture = Math.min(100, Math.max(10, meters.soilMoisture - strat.metrics.waterStressDelta * 0.4));
    meters.income = Math.max(20, Math.round(meters.income * (1 + strat.metrics.incomeReturn / 100)));
    meters.organicMatter = Math.min(100, Math.max(15, meters.organicMatter + strat.metrics.soilCarbonDelta * 0.5));
    meters.erosionRisk = Math.max(10, Math.min(90, meters.erosionRisk - 15));
    setView('SEASON_PLAY');
  }
</script>

<div class="app-root">
  <!-- Persistent Retro Arcade Console Top Bar -->
  <header class="app-header">
    <div class="header-inner">
      <button class="brand-link" onclick={() => setView('STORY_GAME')}>
        <span class="seed-symbol font-pixel">◆</span>
        <span class="brand-title font-pixel">FIELD SHIFT</span>
        <span class="brand-sub font-data">AMMA'S FIELD</span>
      </button>

      <!-- Navigation Tabs -->
      <nav class="nav-links">
        <button 
          class="nav-tab {currentView === 'STORY_GAME' ? 'active' : ''}" 
          onclick={() => setView('STORY_GAME')}
        >
          [◆ HARI'S STORY]
        </button>

        <button 
          class="nav-tab {currentView === 'SEASON_PLAY' ? 'active' : ''}" 
          onclick={() => setView('SEASON_PLAY')}
        >
          [🎮 GBA OVERWORLD]
        </button>

        <button 
          class="nav-tab {currentView === 'REGION_SELECT' ? 'active' : ''}" 
          onclick={() => setView('REGION_SELECT')}
        >
          [🌍 REGIONS]
        </button>

        <button 
          class="nav-tab {currentView === 'STRATEGY_COMPARE' ? 'active' : ''}" 
          onclick={() => setView('STRATEGY_COMPARE')}
        >
          [⚖️ STRATEGIES]
        </button>

        <button 
          class="nav-tab {currentView === 'JOURNAL' ? 'active' : ''}" 
          onclick={() => setView('JOURNAL')}
        >
          [📖 FIELD JOURNAL]
        </button>

        <button 
          class="nav-tab {currentView === 'NASA_DATA' ? 'active' : ''}" 
          onclick={() => setView('NASA_DATA')}
        >
          [🛰️ NASA DATA]
        </button>

        <button 
          class="nav-tab {currentView === 'STYLEGUIDE' ? 'active' : ''}" 
          onclick={() => setView('STYLEGUIDE')}
        >
          [? STYLEGUIDE]
        </button>
      </nav>

      <!-- Sound Toggle -->
      <button 
        class="sound-btn font-data" 
        onclick={() => isMuted = !isMuted}
        title={isMuted ? "Sound Muted" : "Sound Enabled"}
      >
        {isMuted ? "[♪ MUTED]" : "[♪ AUDIO ON]"}
      </button>
    </div>
  </header>

  <!-- Active Main Content Scene -->
  <main class="app-main">
    {#if currentView === 'STORY_GAME'}
      <HariStoryFlow 
        currentRegion={selectedRegion}
        onViewStyleguide={() => setView('STYLEGUIDE')}
        onOpenOverworld={() => setView('SEASON_PLAY')}
      />
    {:else if currentView === 'INTRO'}
      <IntroScreen 
        onStartGame={() => setView('REGION_SELECT')} 
        onViewStyleguide={() => setView('STYLEGUIDE')}
        onViewNasaDocs={() => setView('NASA_DATA')}
      />
    {:else if currentView === 'REGION_SELECT'}
      <RegionSelectScreen 
        onSelectRegion={handleSelectRegion}
        onBack={() => setView('STORY_GAME')}
      />
    {:else if currentView === 'SEASON_PLAY'}
      <div class="mode-switch-bar">
        <span class="mode-label font-data">Display Mode:</span>
        <button 
          class="mode-btn font-pixel {playMode === 'gba' ? 'active' : ''}" 
          onclick={() => playMode = 'gba'}
        >
          [2D GBA OVERWORLD]
        </button>
        <button 
          class="mode-btn font-pixel {playMode === 'almanac' ? 'active' : ''}" 
          onclick={() => playMode = 'almanac'}
        >
          [ILLUSTRATED ALMANAC]
        </button>
      </div>

      {#if playMode === 'gba'}
        <GbaGame 
          currentRegion={selectedRegion}
          {currentEra}
          {meters}
          {currentSeasonName}
          {weatherCondition}
          onOpenCompare={() => setView('STRATEGY_COMPARE')}
          onOpenNasa={() => setView('NASA_DATA')}
          onOpenRegionSelect={() => setView('REGION_SELECT')}
          onOpenStyleguide={() => setView('STYLEGUIDE')}
          onAdvanceSeason={advanceSeason}
        />
      {:else}
        <FarmPlayScreen 
          currentRegion={selectedRegion}
          {currentEra}
          {meters}
          {currentSeasonName}
          {weatherCondition}
          onOpenCompare={() => setView('STRATEGY_COMPARE')}
          onChangeRegion={() => setView('REGION_SELECT')}
          onViewNasaDocs={() => setView('NASA_DATA')}
          onAdvanceSeason={advanceSeason}
          onTriggerEvent={handleTriggerEvent}
        />
      {/if}
    {:else if currentView === 'STRATEGY_COMPARE'}
      <CompareScreen 
        regionId={selectedRegion.id}
        onSelectStrategy={handleSelectStrategy}
        onBack={() => setView('SEASON_PLAY')}
      />
    {:else if currentView === 'JOURNAL'}
      <JournalView />
    {:else if currentView === 'NASA_DATA'}
      <NasaDataView onBack={() => setView('SEASON_PLAY')} />
    {:else if currentView === 'STYLEGUIDE'}
      <StyleguideView onBack={() => setView('SEASON_PLAY')} />
    {/if}
  </main>
</div>

<style>
  .app-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #121A14;
    color: #FAF7F0;
  }

  .app-header {
    background: linear-gradient(180deg, #1A2D20 0%, #122017 100%);
    border-bottom: 3px solid var(--journal-gold, #E5A93C);
    padding: 10px 18px;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  }

  .header-inner {
    max-width: 1360px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .brand-link {
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-align: left;
  }

  .seed-symbol {
    font-size: 1.3rem;
    color: var(--journal-gold, #E5A93C);
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
  }

  .brand-title {
    font-family: var(--font-display, Georgia, serif);
    font-size: 1.15rem;
    font-weight: 700;
    color: #FAF7F0;
    letter-spacing: 0.04em;
    line-height: 1;
  }

  .brand-sub {
    font-family: var(--font-data, monospace);
    font-size: 0.65rem;
    color: var(--journal-gold, #E5A93C);
    padding: 3px 7px;
    background-color: rgba(229, 169, 60, 0.12);
    border: 1px solid var(--journal-gold, #E5A93C);
    border-radius: 4px;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .nav-tab {
    font-family: var(--font-pixel, monospace);
    font-size: 0.64rem;
    color: #CCE2D0;
    background-color: #1D3323;
    border: 2px solid #32553B;
    border-radius: 6px;
    padding: 7px 11px;
    cursor: pointer;
    box-shadow: 0 3px 0 #0C160E;
    transition: transform var(--fast, 130ms) var(--spring, ease), background-color var(--fast, 130ms) ease, color var(--fast, 130ms) ease;
  }

  .nav-tab:hover {
    color: #FFFFFF;
    background-color: #274530;
    border-color: #4C7B56;
    transform: translateY(-2px);
    box-shadow: 0 5px 0 #0C160E;
  }

  .nav-tab:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 #0C160E;
  }

  .nav-tab.active {
    background-color: var(--journal-gold, #E5A93C);
    color: #1B2B1F;
    border-color: #1B2B1F;
    font-weight: bold;
    box-shadow: 0 3px 0 #0C160E, 0 0 14px rgba(229, 169, 60, 0.35);
  }

  .sound-btn {
    font-family: var(--font-pixel, monospace);
    font-size: 0.64rem;
    background-color: #1D3323;
    color: var(--journal-gold, #E5A93C);
    border: 2px solid var(--journal-gold, #E5A93C);
    border-radius: 6px;
    padding: 7px 11px;
    cursor: pointer;
    box-shadow: 0 3px 0 #0C160E;
    transition: transform 120ms ease, background-color 120ms ease;
  }

  .sound-btn:hover {
    background-color: var(--journal-gold, #E5A93C);
    color: #1B2B1F;
    transform: translateY(-2px);
    box-shadow: 0 5px 0 #0C160E;
  }

  .mode-switch-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 10px 16px;
    background-color: #16261B;
    border-bottom: 2px solid #28422F;
  }

  .mode-label {
    font-size: 0.82rem;
    color: #A4C5AB;
    font-weight: 500;
  }

  .mode-btn {
    font-family: var(--font-pixel, monospace);
    font-size: 0.62rem;
    padding: 6px 14px;
    background-color: #101D14;
    border: 2px solid #36573E;
    color: #D1E5D5;
    border-radius: 4px;
    cursor: pointer;
    transition: all 120ms ease;
  }

  .mode-btn:hover {
    border-color: var(--journal-gold, #E5A93C);
    color: #FFFFFF;
  }

  .mode-btn.active {
    background-color: var(--journal-gold, #E5A93C);
    color: #1B2B1F;
    border-color: #1B2B1F;
    font-weight: bold;
    box-shadow: 0 2px 0 #0C160E;
  }

  .app-main {
    flex-grow: 1;
    width: 100%;
    background-color: #121A14;
  }

  /* Responsive Mobile Menu adjustments */
  @media (max-width: 768px) {
    .header-inner {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }
    .brand-link {
      justify-content: space-between;
    }
    .nav-links {
      overflow-x: auto;
      padding-bottom: 4px;
      justify-content: flex-start;
      scrollbar-width: none;
    }
    .nav-links::-webkit-scrollbar {
      display: none;
    }
  }
</style>
