<script lang="ts">
  import type { FarmMeters } from '../../types/game';
  import { sfx } from '../../utils/sound';

  // High-resolution user-supplied assets
  import bg1990 from '../../assets/bg_punjab_1990.png';
  import bg2026 from '../../assets/bg_punjab_2026.png';
  import bg2040 from '../../assets/bg_punjab_2040.png';
  import char1990 from '../../assets/char_bebe_1990.png';
  import char2026 from '../../assets/char_bebe_hari_2026.png';
  import char2040 from '../../assets/char_dada_grandchildren_2040.png';

  interface Props {
    onBackToRegions: () => void;
    onOpenOverworld?: () => void;
    onOpenJournal?: () => void;
    onOpenStrategies?: () => void;
    onOpenNasa?: () => void;
  }

  let { onBackToRegions }: Props = $props();

  // Story Game Progression Stages
  type GameStage = 
    | '1990_INTRO_DIALOGUE' 
    | '1990_MINIGAME' 
    | '1990_FAIL_DIALOGUE'
    | '1990_SUCCESS_DIALOGUE'
    | '2026_INTRO_DIALOGUE' 
    | '2026_MINIGAME' 
    | '2026_FAIL_DIALOGUE'
    | '2026_SUCCESS_DIALOGUE'
    | '2040_INTRO_DIALOGUE' 
    | '2040_MINIGAME' 
    | '2040_FAIL_DIALOGUE'
    | '2040_SUCCESS_DIALOGUE'
    | 'FINAL_CHRONICLE';

  let stage = $state<GameStage>('1990_INTRO_DIALOGUE');

  // Multi-Beat Context & Memory Counters
  let intro1990Beat = $state(0);
  let intro2026Beat = $state(0);
  let intro2040Beat = $state(0);

  // Farm Ecological Indicators (Strictly No Coins in Story Mode)
  let meters = $state<FarmMeters>({
    soilMoisture: 45,
    organicMatter: 35,
    nitrogen: 65,
    erosionRisk: 25,
    income: 200,
    waterUse: 580
  });

  // =========================================================================
  // ERA 1 (1990): CROP ALLOCATION & LIVING SOIL
  // =========================================================================
  type CropType = 'moong' | 'millet' | 'mustard' | 'paddy';

  interface CropOption {
    id: CropType;
    name: string;
    tag: string;
    nitrogenDelta: number;
    somDelta: number;
    waterMm: number;
    description: string;
  }

  const CROP_DATABASE: Record<CropType, CropOption> = {
    moong: {
      id: 'moong',
      name: 'Moong Pulses',
      tag: 'Legume',
      nitrogenDelta: +16,
      somDelta: +8,
      waterMm: 220,
      description: 'Rhizobium bacteria nodules trap atmospheric nitrogen (+35 kg/ha)'
    },
    millet: {
      id: 'millet',
      name: 'Pearl Millet',
      tag: 'Coarse Grain',
      nitrogenDelta: +6,
      somDelta: +7,
      waterMm: 260,
      description: 'Extensive 1.2m taproots aerate subsoil and resist heat stress'
    },
    mustard: {
      id: 'mustard',
      name: 'Winter Mustard',
      tag: 'Cover Crop',
      nitrogenDelta: +8,
      somDelta: +10,
      waterMm: 240,
      description: 'Breaks plow-pan compaction and provides dense pollinator canopy'
    },
    paddy: {
      id: 'paddy',
      name: 'Flooded Basmati',
      tag: 'Paddy Rice',
      nitrogenDelta: -14,
      somDelta: -6,
      waterMm: 850,
      description: 'Continuous 5cm ponding exhausts soil nitrogen and drains water'
    }
  };

  // 4 Farm Plots
  let plot1Crop = $state<CropType>('moong');
  let plot2Crop = $state<CropType>('paddy');
  let plot3Crop = $state<CropType>('millet');
  let plot4Crop = $state<CropType>('mustard');

  const game1NetNitrogen = $derived(
    CROP_DATABASE[plot1Crop].nitrogenDelta +
    CROP_DATABASE[plot2Crop].nitrogenDelta +
    CROP_DATABASE[plot3Crop].nitrogenDelta +
    CROP_DATABASE[plot4Crop].nitrogenDelta
  );

  const game1NetSom = $derived(
    CROP_DATABASE[plot1Crop].somDelta +
    CROP_DATABASE[plot2Crop].somDelta +
    CROP_DATABASE[plot3Crop].somDelta +
    CROP_DATABASE[plot4Crop].somDelta
  );

  const game1TotalWater = $derived(
    CROP_DATABASE[plot1Crop].waterMm +
    CROP_DATABASE[plot2Crop].waterMm +
    CROP_DATABASE[plot3Crop].waterMm +
    CROP_DATABASE[plot4Crop].waterMm
  );

  const game1IsBalanced = $derived(game1NetNitrogen >= 16 && game1TotalWater <= 1800);

  function cyclePlotCrop(plotNumber: 1 | 2 | 3 | 4) {
    sfx.playSelect();
    const cropOrder: CropType[] = ['moong', 'millet', 'mustard', 'paddy'];
    if (plotNumber === 1) plot1Crop = cropOrder[(cropOrder.indexOf(plot1Crop) + 1) % cropOrder.length];
    if (plotNumber === 2) plot2Crop = cropOrder[(cropOrder.indexOf(plot2Crop) + 1) % cropOrder.length];
    if (plotNumber === 3) plot3Crop = cropOrder[(cropOrder.indexOf(plot3Crop) + 1) % cropOrder.length];
    if (plotNumber === 4) plot4Crop = cropOrder[(cropOrder.indexOf(plot4Crop) + 1) % cropOrder.length];
  }

  function handleEvaluateGame1() {
    sfx.playSelect();
    if (game1IsBalanced) {
      meters.nitrogen = Math.min(95, meters.nitrogen + game1NetNitrogen);
      meters.organicMatter = Math.min(85, meters.organicMatter + game1NetSom);
      meters.soilMoisture = 55;
      stage = '1990_SUCCESS_DIALOGUE';
    } else {
      stage = '1990_FAIL_DIALOGUE';
    }
  }

  // =========================================================================
  // ERA 2 (2026): AQUIFER STRESS & TUBEWELL CALIBRATION
  // =========================================================================
  let irrigationMode = $state<'flood' | 'awd'>('flood');
  let sowingWindow = $state<'early_may' | 'mid_june'>('early_may');
  let stubblePractice = $state<'burn' | 'mulch'>('burn');

  const waterTableDrop = $derived.by(() => {
    let drop = 82; // Baseline deep level (meters)
    if (irrigationMode === 'awd') drop -= 8;
    if (sowingWindow === 'mid_june') drop -= 6;
    if (stubblePractice === 'mulch') drop -= 5;
    return drop;
  });

  const pumpStatus = $derived.by(() => {
    if (waterTableDrop >= 80) {
      return { status: 'Critical', label: 'Coughing Sand at 82m (Cavitation Risk)', safe: false };
    }
    if (waterTableDrop >= 72) {
      return { status: 'Strained', label: 'Heavy Drawdown at 74m (High Diesel Cost)', safe: false };
    }
    return { status: 'Safe', label: 'Safe Flow at 63m (Recharge Buffer Intact)', safe: true };
  });

  const graceSatelliteAnomaly = $derived.by(() => {
    if (waterTableDrop <= 65) return '-0.6 cm/yr (Stable Aquifer)';
    if (waterTableDrop <= 75) return '-1.8 cm/yr (Moderate Loss)';
    return '-3.4 cm/yr (Accelerated Depletion)';
  });

  const game2Solved = $derived(pumpStatus.safe);

  function handleEvaluateGame2() {
    sfx.playSelect();
    if (game2Solved) {
      meters.soilMoisture = 62;
      meters.organicMatter = 55;
      meters.waterUse = 390;
      stage = '2026_SUCCESS_DIALOGUE';
    } else {
      stage = '2026_FAIL_DIALOGUE';
    }
  }

  // =========================================================================
  // ERA 3 (2040): GENERATIONAL CLIMATE DILEMMAS
  // =========================================================================
  let q1Answer = $state<number | null>(null);
  let q2Answer = $state<number | null>(null);
  let q3Answer = $state<number | null>(null);

  const game3AllAnswered = $derived(q1Answer !== null && q2Answer !== null && q3Answer !== null);
  const game3AllCorrect = $derived(q1Answer === 1 && q2Answer === 1 && q3Answer === 1);

  function handleEvaluateGame3() {
    sfx.playSelect();
    if (game3AllCorrect) {
      meters.soilMoisture = 68;
      meters.organicMatter = 64;
      meters.nitrogen = 82;
      stage = '2040_SUCCESS_DIALOGUE';
    } else {
      stage = '2040_FAIL_DIALOGUE';
    }
  }

  // Restart Story Game
  function restartAll() {
    sfx.playSelect();
    stage = '1990_INTRO_DIALOGUE';
    intro1990Beat = 0;
    intro2026Beat = 0;
    intro2040Beat = 0;
    plot1Crop = 'moong';
    plot2Crop = 'paddy';
    plot3Crop = 'millet';
    plot4Crop = 'mustard';
    irrigationMode = 'flood';
    sowingWindow = 'early_may';
    stubblePractice = 'burn';
    q1Answer = null;
    q2Answer = null;
    q3Answer = null;
    meters = {
      soilMoisture: 45,
      organicMatter: 35,
      nitrogen: 65,
      erosionRisk: 25,
      income: 200,
      waterUse: 580
    };
  }
</script>

<!-- LITERAL FULLSCREEN EDGE-TO-EDGE VIEWPORT -->
<div class="fullscreen-story-game">
  <!-- Minimalist Top HUD Bar: Strictly Icon-Only Buttons (Back & Restart, No Text) -->
  <div class="game-hud-top">
    <div class="icon-buttons-group">
      <!-- Go Back (Icon only) -->
      <button 
        type="button" 
        class="icon-hud-btn" 
        onclick={onBackToRegions} 
        aria-label="Back"
        title="Exit to Regions"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <!-- Restart (Icon only) -->
      <button 
        type="button" 
        class="icon-hud-btn" 
        onclick={restartAll} 
        aria-label="Restart"
        title="Restart Story"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </button>
    </div>

    <!-- Mini Glass Ecological Meter Indicators (STRICTLY NO COINS) -->
    <div class="meters-glass-pill font-data">
      <span>Moisture {meters.soilMoisture}%</span>
      <span class="dot">·</span>
      <span>SOM {meters.organicMatter}%</span>
      <span class="dot">·</span>
      <span>Nitrogen {meters.nitrogen}%</span>
    </div>
  </div>

  <!-- FULLSCREEN HIGH-RES SCENIC BACKGROUND BY ERA -->
  <div class="scenic-background-container">
    {#if stage.startsWith('1990')}
      <img src={bg1990} alt="Punjab 1990 Farm Landscape" class="fullscreen-bg-img" />
    {:else if stage.startsWith('2026')}
      <img src={bg2026} alt="Punjab 2026 Tubewell Field" class="fullscreen-bg-img" />
    {:else}
      <img src={bg2040} alt="Punjab 2040 Agroecological Ridge" class="fullscreen-bg-img" />
    {/if}
    <div class="bg-vignette-overlay"></div>
  </div>

  <!-- GROUNDED CHARACTER SPRITE (CENTERED ON SOIL PLANE, GENTLE BREATHING) -->
  <div class="grounded-character-container" aria-hidden="true">
    {#if stage.startsWith('1990')}
      <img src={char1990} alt="Young Bebe Amarjit (1990)" class="character-sprite" />
    {:else if stage.startsWith('2026')}
      <img src={char2026} alt="Elder Bebe Amarjit & Hari (2026)" class="character-sprite" />
    {:else}
      <img src={char2040} alt="Dada Hari with Grandchildren (2040)" class="character-sprite" />
    {/if}
  </div>

  <!-- ========================================================================= -->
  <!-- 1. 1990 STORY INTRO (RICH CONTEXT, MEMORY & THE ANCESTRAL SEED URN) -->
  <!-- ========================================================================= -->
  {#if stage === '1990_INTRO_DIALOGUE'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Young Bebe Amarjit (1990)</div>

        {#if intro1990Beat === 0}
          <p class="prompt-text font-body">
            “Look past the canal ridge, child, toward that old kiln-brick well. My grandfather dug that borehole in 1920 with two pairs of bullocks and hemp ropes. For seventy years, its water was sweet enough to brew morning chai. Punjab means ‘Five Rivers’—snowmelt from the Himalayas carrying living silt to our fields.”
          </p>
          <div class="inner-thought font-body">
            *She points toward a heavy brass urn resting in the shade of the veranda—the Beej Patra, darkened by decades of touch. The courtyard smells of sweet dry straw and neem leaves.*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro1990Beat = 1; }}
            >
              “What is inside the brass urn, Bebe?” →
            </button>
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro1990Beat = 1; }}
            >
              “Did our ancestors ever face summer droughts like this?” →
            </button>
          </div>

        {:else if intro1990Beat === 1}
          <p class="prompt-text font-body">
            “Inside are seeds that survived the 1943 famine and the Partition of 1947. When we crossed the border on foot, my mother tied two handfuls of desi moong pulses and pearl millet into the hem of her dupatta. She told me: ‘A family with land can starve if they lose their seeds. But if you hold your ancestral seeds, you can start Punjab anew anywhere there is dirt.’”
          </p>
          <div class="inner-thought font-body">
            *She unseals the brass lid. Inside, small olive-green moong beans and mottled pearl millet grains rest in dry cow dung ash and dried neem leaves to ward off weevils. They feel smooth, cool, and timeless in my palm.*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro1990Beat = 2; }}
            >
              “Why are the government block officers telling farmers to throw these away?” →
            </button>
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro1990Beat = 2; }}
            >
              “They say the new hybrid rice yields three times as much grain.” →
            </button>
          </div>

        {:else if intro1990Beat === 2}
          <p class="prompt-text font-body">
            “Yield without roots is a trap, child! The officers arrive in white jeeps with bags of synthetic urea pellets, calling them 'miracle salts.' They tell farmers: 'Stop planting pulses! Flood your fields with basmati rice from boundary to boundary!' But continuous standing water suffocates the earth. The village has already begun forgetting—they cut down the pulse trees, stopped singing the monsoon sowing songs, and the soil is baking hard as brick.”
          </p>
          <div class="inner-thought font-body">
            *In the distance, an urea delivery truck kicks up a long trail of pale chemical dust along the canal road. Neighbors are plowing up ancient lentil fields to make way for flooded basmati.*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro1990Beat = 3; }}
            >
              “I won’t let our family forget, Bebe. Teach me how to balance our soil.” →
            </button>
          </div>

        {:else}
          <p class="prompt-text font-body">
            “A land that forgets its ancestors is like a tree with severed roots. Beneath our feet live billions of microscopic weavers. If you plant moong pulses, their roots invite symbiotic Rhizobium bacteria to brew biological nitrogen directly from the sky. And deep mustard taproots will drill through the plow pan without an iron blade. Show me you remember our family's wisdom: balance our four plots so nitrogen reaches +16 kg/ha and water stays under 1,800 millimeters!”
          </p>
          <div class="inner-thought font-body">
            *She dips her fingers in the cool canal water and marks my forehead with a smudge of dark silt—an ancestral blessing before the work begins.*
          </div>
          <div class="game-actions-row">
            <button 
              type="button" 
              class="continue-btn font-display" 
              onclick={() => { sfx.playSelect(); stage = '1990_MINIGAME'; }}
            >
              Begin 1990 Field Crop Allocation →
            </button>
          </div>
        {/if}
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 2. 1990 MINIGAME: 4-PLOT CROP & NITROGEN BOARD -->
  <!-- ========================================================================= -->
  {:else if stage === '1990_MINIGAME'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Crop & Nitrogen Allocation Board</div>
        <p class="prompt-text font-body">
          Rotate crops on the four plots to achieve positive biological nitrogen balance (+16 kg/ha) without overdrawing water (&le; 1800mm):
        </p>
      </div>

      <!-- 4 Farm Plots Grid -->
      <div class="plots-grid">
        <button type="button" class="plot-card" onclick={() => cyclePlotCrop(1)}>
          <div class="plot-header">
            <span class="plot-num font-data">Plot 1: Canal Bend</span>
            <span class="crop-tag font-data">{CROP_DATABASE[plot1Crop].tag}</span>
          </div>
          <strong class="crop-name font-display">{CROP_DATABASE[plot1Crop].name}</strong>
          <span class="crop-desc font-body">{CROP_DATABASE[plot1Crop].description}</span>
          <span class="click-hint font-data">Tap to rotate crop ↻</span>
        </button>

        <button type="button" class="plot-card" onclick={() => cyclePlotCrop(2)}>
          <div class="plot-header">
            <span class="plot-num font-data">Plot 2: Wellhead</span>
            <span class="crop-tag font-data">{CROP_DATABASE[plot2Crop].tag}</span>
          </div>
          <strong class="crop-name font-display">{CROP_DATABASE[plot2Crop].name}</strong>
          <span class="crop-desc font-body">{CROP_DATABASE[plot2Crop].description}</span>
          <span class="click-hint font-data">Tap to rotate crop ↻</span>
        </button>

        <button type="button" class="plot-card" onclick={() => cyclePlotCrop(3)}>
          <div class="plot-header">
            <span class="plot-num font-data">Plot 3: North Ridge</span>
            <span class="crop-tag font-data">{CROP_DATABASE[plot3Crop].tag}</span>
          </div>
          <strong class="crop-name font-display">{CROP_DATABASE[plot3Crop].name}</strong>
          <span class="crop-desc font-body">{CROP_DATABASE[plot3Crop].description}</span>
          <span class="click-hint font-data">Tap to rotate crop ↻</span>
        </button>

        <button type="button" class="plot-card" onclick={() => cyclePlotCrop(4)}>
          <div class="plot-header">
            <span class="plot-num font-data">Plot 4: Pasture Edge</span>
            <span class="crop-tag font-data">{CROP_DATABASE[plot4Crop].tag}</span>
          </div>
          <strong class="crop-name font-display">{CROP_DATABASE[plot4Crop].name}</strong>
          <span class="crop-desc font-body">{CROP_DATABASE[plot4Crop].description}</span>
          <span class="click-hint font-data">Tap to rotate crop ↻</span>
        </button>
      </div>

      <!-- Real-Time Telemetry Bar -->
      <div class="telemetry-bar">
        <div class="telemetry-item">
          <span class="tel-label font-data">Biological Nitrogen Net:</span>
          <span class="tel-value font-display {game1NetNitrogen >= 16 ? 'positive' : 'negative'}">
            {game1NetNitrogen > 0 ? '+' : ''}{game1NetNitrogen} kg/ha
          </span>
        </div>
        <div class="telemetry-item">
          <span class="tel-label font-data">Humus Carbon Addition:</span>
          <span class="tel-value font-display {game1NetSom > 0 ? 'positive' : 'negative'}">
            {game1NetSom > 0 ? '+' : ''}{game1NetSom}% SOM
          </span>
        </div>
        <div class="telemetry-item">
          <span class="tel-label font-data">Total Water Demand:</span>
          <span class="tel-value font-display {game1TotalWater <= 1800 ? 'positive' : 'negative'}">
            {game1TotalWater} mm
          </span>
        </div>
      </div>

      <div class="game-actions-row">
        <button type="button" class="action-btn font-display" onclick={handleEvaluateGame1}>
          Evaluate Soil Biology & Nitrogen Balance
        </button>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 3. 1990 FAIL DIALOGUE: BEBE REPRIMANDS & ASKS TO TRY AGAIN -->
  <!-- ========================================================================= -->
  {:else if stage === '1990_FAIL_DIALOGUE'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Young Bebe Amarjit (1990)</div>
        <p class="prompt-text font-body">
          “Stop right there, child! Dig your hands into the mud. Smell that sour, sulfurous stench? That is anaerobic decay! You flooded the fields with basmati rice monoculture—demanding {game1TotalWater}mm of water that our canal cannot supply! And where will nitrogen come from when the soil drops to {game1NetNitrogen} kg/ha?”
        </p>
        <div class="inner-thought font-body">
          *Bebe shakes her head, kneeling down and showing me the sticky, gray anaerobic clay clinging to her fingers. The soil is suffocating under standing water without legume air.*
        </div>
        <p class="prompt-text font-body" style="margin-top: 6px; font-weight: 600; color: #BF360C;">
          “Legumes are the lungs of this farm! Go back to the plots. Pull out that thirsty paddy and sow moong pulses or taproot mustard until biological nitrogen reaches +16 kg/ha. Try again!”
        </p>
      </div>

      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display" 
          onclick={() => { sfx.playSelect(); stage = '1990_MINIGAME'; }}
        >
          ↺ Try Again with Bebe's Guidance
        </button>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 4. 1990 SUCCESS DIALOGUE: BEBE PRAISES & EXPLAINS ROOT NODULES -->
  <!-- ========================================================================= -->
  {:else if stage === '1990_SUCCESS_DIALOGUE'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Young Bebe Amarjit (1990)</div>
        <p class="prompt-text font-body">
          “Look at you! You listened to the soil. Kneel down here beside me. See these tiny pink nodules clustering along the moong roots? Break one open between your fingernails. See that flush of red? That is leghemoglobin—proof that the Rhizobium bacteria are working, breathing nitrogen straight from the air and locking it into rich humus!”
        </p>
        <div class="inner-thought font-body">
          *The earth in my palm smells rich, dark, and sweet, like monsoon rain falling on warm stone. The deep mustard taproots have already loosened the plow pan, while the moong leaves flutter softly in the canal breeze.*
        </div>
        <p class="prompt-text font-body" style="margin-top: 6px; font-style: italic;">
          “Soil memory lasts longer than iron, child. In the decades ahead, salesmen and politicians will tell you to drill to the center of the earth and torch your stubble into smoke. Remember this day. Remember the smell of living soil. Now... let the seasons turn.”
        </p>
      </div>

      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display" 
          onclick={() => { sfx.playSelect(); stage = '2026_INTRO_DIALOGUE'; }}
        >
          Travel 36 Years into the Future (Year 2026) →
        </button>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 5. 2026 STORY INTRO (GHOST WELLS, SINKING AQUIFER & THE ANCESTRAL URN) -->
  <!-- ========================================================================= -->
  {:else if stage === '2026_INTRO_DIALOGUE'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">
          {intro2026Beat === 0 ? 'Hari (2026)' : 'Elder Bebe Amarjit (2026)'}
        </div>

        {#if intro2026Beat === 0}
          <p class="prompt-text font-body">
            “Bebe! Kill the power breaker! The submersible tubewell pump is coughing sand again! Listen to that iron impeller screech!”
          </p>
          <div class="inner-thought font-body">
            *A violent shudder vibrates through the blue galvanized borehole pipe. Behind the pump house, the 1920 brick well that my great-grandfather dug sits bone-dry—a dark hollow shaft choked with dead weeds. The water table that sustained four centuries of farming has plummeted into the deep rock.*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro2026Beat = 1; }}
            >
              “How did the groundwater drop seventy meters in thirty years, Hari?” →
            </button>
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro2026Beat = 1; }}
            >
              “Can’t we just drill deeper like the other farmers?” →
            </button>
          </div>

        {:else if intro2026Beat === 1}
          <p class="prompt-text font-body">
            “We are at eighty-two meters deep, sucking the last gritty gravel! Every house in the village installed heavy sixty-horsepower submersibles, pumping day and night for three crops of paddy. Three borewells collapsed in our lane this month. Last week, when the diesel bill arrived, I almost took Bebe’s brass seed urn to the town pawnshop to pay for a new motor!”
          </p>
          <div class="inner-thought font-body">
            *Elder Bebe Amarjit steps forward, her walking stick thumping against the parched ground. Her hair is silver, her posture bent with eighty-five years of living, but her eyes flare with fierce ancestral fury.*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro2026Beat = 2; }}
            >
              “Sell the brass urn, Hari? What did Bebe say?” →
            </button>
          </div>

        {:else if intro2026Beat === 2}
          <p class="prompt-text font-body">
            “Pawn our mother's brass urn?! The seeds that walked across the border in 1947?! Have you lost your mind, Hari?! You don't sell your family’s soul to buy a deeper grave! Look up into the sky. NASA’s GRACE satellites—twin orbital crafts measuring Earth’s gravitational field—look down upon Punjab and confirm what my aching bones already know: our groundwater is vanishing by −3.2 centimeters every year! Sixty cubic kilometers of ancient subterranean water, gone in a single generation!”
          </p>
          <div class="inner-thought font-body">
            *Across the village ridge, dark plumes of acrid stubble smoke rise into the pale sky. The heat is stifling, burning our eyes and throats.*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro2026Beat = 3; }}
            >
              “Forgive us, Bebe. How do we save the borehole without selling our seeds?” →
            </button>
          </div>

        {:else}
          <p class="prompt-text font-body">
            “Science and memory speak the exact same truth! You don't surrender—you calibrate! Switch to Alternate Wetting and Drying (AWD)—allowing the rice roots to breathe oxygen between irrigations. Shift sowing to sync with the mid-June monsoon so the sky does the pumping. And stop setting the straw on fire! Cut it with the Happy Seeder and mulch it back into the topsoil to hold forty percent more moisture. Help him calibrate the farm before this motor burns out!”
          </p>
          <div class="inner-thought font-body">
            *Hari looks at the blue pipe, wiping grease and sweat from his forehead. He nods quietly, feeling the weight of the generations on his shoulders.*
          </div>
          <div class="game-actions-row">
            <button 
              type="button" 
              class="continue-btn font-display" 
              onclick={() => { sfx.playSelect(); stage = '2026_MINIGAME'; }}
            >
              Calibrate Tubewell & Farm Practices →
            </button>
          </div>
        {/if}
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 6. 2026 MINIGAME: TUBEWELL CALIBRATION & WATER STRESS -->
  <!-- ========================================================================= -->
  {:else if stage === '2026_MINIGAME'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Tubewell & Aquifer Stress Simulator</div>
        <p class="prompt-text font-body">
          Calibrate irrigation, sowing window, and stubble mulch to prevent pump cavitation (&le; 65m) and stabilize the aquifer:
        </p>
      </div>

      <!-- 3 Practice Levers -->
      <div class="toggles-cluster">
        <div class="toggle-card">
          <span class="toggle-label font-data">1. Irrigation Method</span>
          <div class="segmented-control">
            <button 
              type="button" 
              class="seg-btn {irrigationMode === 'flood' ? 'active' : ''}" 
              onclick={() => { irrigationMode = 'flood'; sfx.playSelect(); }}
            >
              Continuous Flooding (750mm)
            </button>
            <button 
              type="button" 
              class="seg-btn {irrigationMode === 'awd' ? 'active' : ''}" 
              onclick={() => { irrigationMode = 'awd'; sfx.playSelect(); }}
            >
              Alternate Wetting & Drying / AWD (-38% Water)
            </button>
          </div>
        </div>

        <div class="toggle-card">
          <span class="toggle-label font-data">2. Paddy Sowing Window</span>
          <div class="segmented-control">
            <button 
              type="button" 
              class="seg-btn {sowingWindow === 'early_may' ? 'active' : ''}" 
              onclick={() => { sowingWindow = 'early_may'; sfx.playSelect(); }}
            >
              Early May (Peak Heat Evaporation)
            </button>
            <button 
              type="button" 
              class="seg-btn {sowingWindow === 'mid_june' ? 'active' : ''}" 
              onclick={() => { sowingWindow = 'mid_june'; sfx.playSelect(); }}
            >
              Mid June (Monsoon Synchronization)
            </button>
          </div>
        </div>

        <div class="toggle-card">
          <span class="toggle-label font-data">3. Crop Stubble Treatment</span>
          <div class="segmented-control">
            <button 
              type="button" 
              class="seg-btn {stubblePractice === 'burn' ? 'active' : ''}" 
              onclick={() => { stubblePractice = 'burn'; sfx.playSelect(); }}
            >
              Stubble Burning (Bakes Soil, 0% Retention)
            </button>
            <button 
              type="button" 
              class="seg-btn {stubblePractice === 'mulch' ? 'active' : ''}" 
              onclick={() => { stubblePractice = 'mulch'; sfx.playSelect(); }}
            >
              Happy Seeder Mulch (+40% Moisture Buffer)
            </button>
          </div>
        </div>
      </div>

      <!-- Live Aquifer Gauge Panel -->
      <div class="aquifer-gauge-panel">
        <div class="gauge-stat">
          <span class="stat-title font-data">Aquifer Depth:</span>
          <span class="stat-number font-display {waterTableDrop <= 65 ? 'safe' : 'danger'}">
            {waterTableDrop} meters
          </span>
        </div>
        <div class="gauge-stat">
          <span class="stat-title font-data">Pump Operating Status:</span>
          <span class="status-badge font-data {pumpStatus.safe ? 'safe' : 'danger'}">
            {pumpStatus.label}
          </span>
        </div>
        <div class="gauge-stat">
          <span class="stat-title font-data">NASA GRACE Satellite Anomaly:</span>
          <span class="stat-satellite font-data">{graceSatelliteAnomaly}</span>
        </div>
      </div>

      <div class="game-actions-row">
        <button type="button" class="action-btn font-display" onclick={handleEvaluateGame2}>
          Test Tubewell & Aquifer Flow
        </button>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 7. 2026 FAIL DIALOGUE: PUMP SQUEALS & BEBE ASKS TO RETRY -->
  <!-- ========================================================================= -->
  {:else if stage === '2026_FAIL_DIALOGUE'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Elder Bebe Amarjit (2026)</div>
        <p class="prompt-text font-body">
          “Shut it off, Hari! SHUT IT OFF! Listen to that impeller screeching! The borehole level is at {waterTableDrop} meters—you are sucking straight sand and burning the electric motor! NASA GRACE shows regional depletion accelerating at {graceSatelliteAnomaly}!”
        </p>
        <div class="inner-thought font-body">
          *Hari frantically lunges for the circuit breaker. A cloud of sulfurous electrical smoke leaks from the pump switchbox. If we don't fix this, the pump will seize permanently.*
        </div>
        <p class="prompt-text font-body" style="margin-top: 6px; font-weight: 600; color: #BF360C;">
          “You cannot keep flooding the fields in early May heat and setting the straw on fire! Shift your sowing to mid-June, switch to AWD to let the roots breathe, and mulch with the Happy Seeder. Try again!”
        </p>
      </div>

      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display" 
          onclick={() => { sfx.playSelect(); stage = '2026_MINIGAME'; }}
        >
          ↺ Try Again with Bebe's Calibration
        </button>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 8. 2026 SUCCESS DIALOGUE: CLEAR WATER, TRIBUTE TO DRY WELL & PLEDGE -->
  <!-- ========================================================================= -->
  {:else if stage === '2026_SUCCESS_DIALOGUE'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Hari & Elder Bebe Amarjit (2026)</div>
        <p class="prompt-text font-body">
          “Bebe! Look at the pipe! The water... it’s running crystal clear! Cool, sweet water gushing at full volume without a trace of sand!”
        </p>
        <div class="inner-thought font-body">
          *Elder Bebe Amarjit scoops a small brass bowl of the cool water. Slowly, she walks over to the dry 1920 brick well. She pours the fresh water into the dark opening, whispering a silent prayer to the ancestors.*
        </div>
        <p class="prompt-text font-body" style="margin-top: 6px;">
          “By shifting sowing to mid-June, you let the monsoon recharge thirty percent of the soil. By using Alternate Wetting and Drying, you gave the rice roots oxygen. And look across the ridge—no suffocating smoke this harvest! The Happy Seeder laid a four-inch mulch blanket that cooled the topsoil by four degrees. You saved our well, Hari. Swear to me you will teach your children Kabir and Rani to never forget this.”
        </p>
        <p class="prompt-text font-body" style="font-style: italic; color: var(--journal-forest, #1F3825);">
          “I swear on this soil, Bebe. Our water will still be singing when they grow up.”
        </p>
      </div>

      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display" 
          onclick={() => { sfx.playSelect(); stage = '2040_INTRO_DIALOGUE'; }}
        >
          Travel 14 Years into the Future (Year 2040) →
        </button>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 9. 2040 STORY INTRO (GHOST VILLAGES, THE BRASS URN & GENERATIONAL CHAIN) -->
  <!-- ========================================================================= -->
  {:else if stage === '2040_INTRO_DIALOGUE'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">
          {intro2040Beat === 0 ? 'Kabir & Rani (2040)' : 'Dada Hari (2040)'}
        </div>

        {#if intro2040Beat === 0}
          <p class="prompt-text font-body">
            “Dada-ji! The meteorological emergency siren just sounded in the block center! The monsoon has stalled three weeks over the ocean, and NASA POWER telemetry shows our regional summer temperature is +2.4°C hotter than normal!”
          </p>
          <div class="inner-thought font-body">
            *We stand under the ancient banyan tree. Kabir is clutching the very same brass urn—the Beej Patra—that Bebe Amarjit protected in 1990 and 2026. Inside are the heirloom moong and millet seeds that survived fifty years of drought.*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro2040Beat = 1; }}
            >
              “Dada-ji, tell us about the ghost villages downstream.” →
            </button>
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro2040Beat = 1; }}
            >
              “Why are the corporate seed agents in the village square?” →
            </button>
          </div>

        {:else if intro2040Beat === 1}
          <p class="prompt-text font-body">
            “Three miles west, in village Kalan, they ignored the warnings. They kept drilling deeper—past one hundred and fifty meters—until their pumps hit ancient saltwater. Today, their topsoil is encrusted with white salt. The houses are padlocked, the tractors abandoned, and the families scattered to urban slums. But our soil is dark and spongy because fifty years ago, your great-grandmother Bebe Amarjit taught us to feed the earth.”
          </p>
          <div class="inner-thought font-body">
            *Rani reaches into the brass urn, letting the dark moong seeds trickle through her fingers. She smiles softly: ‘Great-grandmother Bebe’s seeds... they smell like rain before it falls.’*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro2040Beat = 2; }}
            >
              “The salesmen in the square want us to take their chemical hybrids on credit.” →
            </button>
          </div>

        {:else if intro2040Beat === 2}
          <p class="prompt-text font-body">
            “The salesman promises miracles, but he wants to make you tenants on your own land! In 1990, Bebe fought the urea salesmen. In 2026, we fought the deep-borewell panic. In 2040, your test is climate resilience and community sovereignty. If you take their proprietary seeds on debt, one bad drought puts this ancestral farm in corporate vaults. True resilience cannot be bought in a plastic packet!”
          </p>
          <div class="inner-thought font-body">
            *Dada Hari places his weathered hands on Kabir and Rani’s shoulders. His eyes glisten with fifty years of memory, sorrow, and unshakeable pride.*
          </div>
          <div class="story-choice-group">
            <button 
              type="button" 
              class="story-reply-btn font-body"
              onclick={() => { sfx.playSelect(); intro2040Beat = 3; }}
            >
              “We won’t break the chain, Dada-ji. Guide us through the crisis.” →
            </button>
          </div>

        {:else}
          <p class="prompt-text font-body">
            “We open this brass urn today. We share these seeds with our village seed bank, share water through our cooperative solar drip grid, and plant drought-hardy pulses that laugh at heatwaves! Resolve these three dilemmas to secure the next fifty years of Punjab’s living soil!”
          </p>
          <div class="inner-thought font-body">
            *The wind rises over the fields, rustling the green millet canopy. Three generations of family history stand united behind this moment.*
          </div>
          <div class="game-actions-row">
            <button 
              type="button" 
              class="continue-btn font-display" 
              onclick={() => { sfx.playSelect(); stage = '2040_MINIGAME'; }}
            >
              Resolve the 2040 Climate Dilemmas →
            </button>
          </div>
        {/if}
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 10. 2040 MINIGAME: 3 CLIMATE & POLICY DILEMMAS -->
  <!-- ========================================================================= -->
  {:else if stage === '2040_MINIGAME'}
    <div class="minigame-floating-card scrollable-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Generational Climate Adaptation Lab</div>
        <p class="prompt-text font-body">
          NASA POWER projected anomalies indicate +2.4°C regional warming. Resolve these three dilemmas to secure the farm:
        </p>
      </div>

      <!-- 3 Dilemmas Stack -->
      <div class="scenario-dilemmas">
        <div class="dilemma-card">
          <span class="dilemma-num font-data">Scenario 1: Delayed Monsoon (+3 Weeks Extreme Heatwave)</span>
          <div class="dilemma-options">
            <button 
              type="button" 
              class="dilemma-btn {q1Answer === 1 ? 'selected' : ''}" 
              onclick={() => { q1Answer = 1; sfx.playSelect(); }}
            >
              <strong>Adopt Short-Duration Pearl Millet & Pulses:</strong>
              <span>Survives heat spell with 70% less irrigation, protecting remaining groundwater.</span>
            </button>
            <button 
              type="button" 
              class="dilemma-btn {q1Answer === 2 ? 'selected' : ''}" 
              onclick={() => { q1Answer = 2; sfx.playSelect(); }}
            >
              <strong>Continuous Deep Diesel Pumping for Flooded Rice:</strong>
              <span>Extracted water evaporates rapidly, risking catastrophic well burnout.</span>
            </button>
          </div>
        </div>

        <div class="dilemma-card">
          <span class="dilemma-num font-data">Scenario 2: State Groundwater Rationing & Electricity Quotas</span>
          <div class="dilemma-options">
            <button 
              type="button" 
              class="dilemma-btn {q2Answer === 1 ? 'selected' : ''}" 
              onclick={() => { q2Answer = 1; sfx.playSelect(); }}
            >
              <strong>Cooperative Solar Micro-Irrigation Drip Grid:</strong>
              <span>Shares metered water equitably across village plots at zero diesel fuel cost.</span>
            </button>
            <button 
              type="button" 
              class="dilemma-btn {q2Answer === 2 ? 'selected' : ''}" 
              onclick={() => { q2Answer = 2; sfx.playSelect(); }}
            >
              <strong>Illicit Nighttime Borewell Pumping:</strong>
              <span>Triggers electrical grid penalties and accelerates community water table collapse.</span>
            </button>
          </div>
        </div>

        <div class="dilemma-card">
          <span class="dilemma-num font-data">Scenario 3: Market Volatility & Seed Sovereignty</span>
          <div class="dilemma-options">
            <button 
              type="button" 
              class="dilemma-btn {q3Answer === 1 ? 'selected' : ''}" 
              onclick={() => { q3Answer = 1; sfx.playSelect(); }}
            >
              <strong>Community Heirloom Seed Bank + MSP Pulse Procurement:</strong>
              <span>Guarantees farmer income floor and preserves genetically climate-resilient local landraces.</span>
            </button>
            <button 
              type="button" 
              class="dilemma-btn {q3Answer === 2 ? 'selected' : ''}" 
              onclick={() => { q3Answer = 2; sfx.playSelect(); }}
            >
              <strong>100% Proprietary Single-Use Chemical Hybrid Seeds:</strong>
              <span>Maximizes debt exposure when extreme weather triggers crop failure.</span>
            </button>
          </div>
        </div>
      </div>

      {#if game3AllAnswered}
        <div class="game-actions-row">
          <button type="button" class="continue-btn font-display" onclick={handleEvaluateGame3}>
            Test Generational Decisions →
          </button>
        </div>
      {/if}
    </div>

  <!-- ========================================================================= -->
  <!-- 11. 2040 FAIL DIALOGUE: DADA HARI WARNS AGAINST DEBT & COLLAPSE -->
  <!-- ========================================================================= -->
  {:else if stage === '2040_FAIL_DIALOGUE'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Dada Hari (2040)</div>
        <p class="prompt-text font-body">
          “Hold on, Kabir! Stop and think, Rani! If you sign those credit agreements for single-use chemical hybrids, or run diesel pumps until the aquifer cracks, what happens when the next 45-day heatwave strikes? The diesel tanks run dry, the borehole fills with sand, and the loan agents take your land!”
        </p>
        <div class="inner-thought font-body">
          *Dada Hari's voice is stern yet filled with grandfatherly care. He points across the village boundary to an abandoned tractor rusting in an empty, salt-encrusted field.*
        </div>
        <p class="prompt-text font-body" style="margin-top: 6px; font-weight: 600; color: #BF360C;">
          “Bebe Amarjit did not spend fifty years teaching us living soil biology for us to surrender to debt in 2040! In an extreme climate, true resilience is collective. Re-think your choices—choose drought-hardy pulses, solar cooperative drip, and heirloom seed sovereignty!”
        </p>
      </div>

      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display" 
          onclick={() => { sfx.playSelect(); stage = '2040_MINIGAME'; }}
        >
          ↺ Re-evaluate Climate Decisions
        </button>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 12. 2040 SUCCESS DIALOGUE: PASSING THE BRASS URN & 50-YEAR PROMISE -->
  <!-- ========================================================================= -->
  {:else if stage === '2040_SUCCESS_DIALOGUE'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">Dada Hari with Kabir & Rani (2040)</div>
        <p class="prompt-text font-body">
          “You chose with the true wisdom of the elders! Look out over our fields. While our neighbors’ diesel pumps sputtered and stalled, our pearl millet and moong pulses stood proud. Our community solar micro-irrigation grid shared every drop with surgical precision. And our heirloom seed bank kept us entirely free from debt!”
        </p>
        <div class="inner-thought font-body">
          *Dada Hari carefully places the ancient brass seed urn into Kabir and Rani's hands. Tears of joy roll down his white beard.*
        </div>
        <p class="prompt-text font-body" style="margin-top: 6px;">
          “Dada-ji... Bebe Amarjit’s well is still singing. The water is sweet, cool, and clear.”
        </p>
        <p class="prompt-text font-body" style="font-style: italic; color: var(--journal-forest, #1F3825);">
          “Then my fifty-year promise to Bebe is fulfilled. Punjab's living earth has triumphed. This brass urn and this living farm are yours now, children. Guard them with your lives.”
        </p>
      </div>

      <div class="game-actions-row">
        <button 
          type="button" 
          class="continue-btn font-display" 
          onclick={() => { sfx.playSelect(); stage = 'FINAL_CHRONICLE'; }}
        >
          View 50-Year Generational Stewardship Chronicle →
        </button>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 13. FINAL 50-YEAR CHRONICLE & ETHICAL MANDATE -->
  <!-- ========================================================================= -->
  {:else if stage === 'FINAL_CHRONICLE'}
    <div class="minigame-floating-card">
      <div class="card-prompt-head">
        <div class="speaker-tag font-display">50-Year Farm Stewardship Chronicle (1990–2040)</div>
        <p class="prompt-text font-body">
          Across three generations, your decisions transitioned the farm from severe groundwater depletion to enduring regenerative vitality:
        </p>
      </div>

      <!-- Ecological Indicators (Strictly No Coins) -->
      <div class="chronicle-summary-grid">
        <div class="summary-box">
          <span class="box-label font-data">Soil Organic Carbon</span>
          <strong class="box-val font-display">64% SOM</strong>
          <span class="box-sub font-body">Spongy topsoil humus retains water</span>
        </div>
        <div class="summary-box">
          <span class="box-label font-data">NASA GRACE Aquifer Trend</span>
          <strong class="box-val font-display safe">−0.6 cm/yr</strong>
          <span class="box-sub font-body">Recharge buffer successfully protected</span>
        </div>
        <div class="summary-box">
          <span class="box-label font-data">Biological Nitrogen</span>
          <strong class="box-val font-display">82% Net</strong>
          <span class="box-sub font-body">Legume nodules eliminated chemical bags</span>
        </div>
        <div class="summary-box">
          <span class="box-label font-data">Community Sovereignty</span>
          <strong class="box-val font-display safe">100% Autonomous</strong>
          <span class="box-sub font-body">Independent seed bank & solar grid</span>
        </div>
      </div>

      <!-- Ethical System Mandate (DOCX Verbatim) -->
      <div class="ethical-mandate-card font-body">
        “Field Shift supports farmers and local experts. It does not replace their judgement.”
      </div>

      <div class="game-actions-row">
        <button type="button" class="action-btn secondary font-display" onclick={restartAll}>
          ↺ Replay Story & Games
        </button>
        <button type="button" class="continue-btn font-display" onclick={onBackToRegions}>
          Exit to Regions
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  /* LITERAL FULLSCREEN EDGE-TO-EDGE CONTAINER */
  .fullscreen-story-game {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    background-color: #0F1710;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* HUD Top Bar */
  .game-hud-top {
    position: absolute;
    top: 16px;
    left: 20px;
    right: 20px;
    z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;
  }

  .icon-buttons-group {
    display: flex;
    gap: 10px;
    pointer-events: auto;
  }

  .icon-hud-btn {
    background-color: rgba(27, 43, 31, 0.92);
    backdrop-filter: blur(8px);
    border: 2px solid var(--journal-gold, #E5A93C);
    border-radius: 50%;
    width: 44px;
    height: 44px;
    color: var(--journal-paper, #FAF6ED);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    transition: transform 0.15s, background-color 0.15s;
  }

  .icon-hud-btn:hover {
    transform: scale(1.08);
    background-color: var(--journal-forest, #1F3825);
    border-color: #FFFFFF;
  }

  .meters-glass-pill {
    pointer-events: auto;
    background-color: rgba(27, 43, 31, 0.9);
    backdrop-filter: blur(8px);
    border: 1.5px solid rgba(229, 169, 60, 0.7);
    border-radius: 999px;
    padding: 6px 16px;
    color: var(--journal-paper, #FAF6ED);
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  }

  .dot {
    color: var(--journal-gold, #E5A93C);
  }

  /* Fullscreen Scenic Background */
  .scenic-background-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    overflow: hidden;
  }

  .fullscreen-bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    animation: fadeIn 0.4s ease-out;
  }

  .bg-vignette-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, transparent 35%, rgba(15, 23, 16, 0.45) 100%),
                linear-gradient(to top, rgba(15, 23, 16, 0.75) 0%, transparent 45%);
    pointer-events: none;
  }

  /* Grounded Character Figure */
  .grounded-character-container {
    position: absolute;
    bottom: clamp(170px, 30vh, 320px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    pointer-events: none;
    max-height: 48vh;
  }

  .character-sprite {
    max-height: 46vh;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.65));
    animation: gentleBob 3.5s ease-in-out infinite alternate;
  }

  @keyframes gentleBob {
    0% { transform: translateY(0); }
    100% { transform: translateY(-5px); }
  }

  /* Floating Card (Story Dialogues & Minigames) */
  .minigame-floating-card {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: min(94vw, 980px);
    max-height: 46vh;
    z-index: 40;
    background: rgba(250, 246, 237, 0.96);
    backdrop-filter: blur(16px);
    border: 3px solid var(--journal-ink, #1B2B1F);
    border-radius: 12px;
    padding: 14px 20px;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 4px 0 var(--journal-ink, #1B2B1F);
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    animation: slideUp 0.3s ease-out;
  }

  .scrollable-card {
    max-height: 52vh;
  }

  .card-prompt-head {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .speaker-tag {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--journal-forest, #1F3825);
    border-bottom: 2px solid var(--journal-gold, #E5A93C);
    display: inline-block;
    align-self: flex-start;
  }

  .prompt-text {
    font-size: 0.92rem;
    color: var(--journal-ink, #1B2B1F);
    margin: 0;
    line-height: 1.4;
  }

  /* Inner Thought Box */
  .inner-thought {
    font-size: 0.84rem;
    font-style: italic;
    color: var(--journal-soil, #7C4A2D);
    background-color: color-mix(in srgb, var(--journal-gold, #E5A93C) 12%, #FAF6ED);
    border-left: 3px solid var(--journal-gold, #E5A93C);
    padding: 6px 12px;
    border-radius: 0 4px 4px 0;
    line-height: 1.35;
    margin: 4px 0;
  }

  /* Story Choice Options */
  .story-choice-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 6px;
  }

  .story-reply-btn {
    background-color: #FFFFFF;
    border: 2px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 0.88rem;
    color: var(--journal-forest, #1F3825);
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
    transition: transform 0.15s, background-color 0.15s;
  }

  .story-reply-btn:hover {
    transform: translateY(-2px);
    background-color: var(--journal-gold, #E5A93C);
  }

  /* Minigame 1: Plots Grid */
  .plots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 8px;
  }

  .plot-card {
    background-color: #FFFFFF;
    border: 2px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 8px 10px;
    text-align: left;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 3px;
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
    transition: transform 0.15s, background-color 0.15s;
  }

  .plot-card:hover {
    transform: translateY(-2px);
    background-color: color-mix(in srgb, var(--journal-gold, #E5A93C) 20%, #FFFFFF);
  }

  .plot-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .plot-num {
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--journal-soil, #7C4A2D);
  }

  .crop-tag {
    font-size: 0.62rem;
    background-color: var(--journal-forest, #1F3825);
    color: #FFFFFF;
    padding: 1px 5px;
    border-radius: 4px;
  }

  .crop-name {
    font-size: 0.95rem;
    color: var(--journal-forest, #1F3825);
  }

  .crop-desc {
    font-size: 0.76rem;
    color: var(--journal-ink, #1B2B1F);
    line-height: 1.25;
    flex-grow: 1;
  }

  .click-hint {
    font-size: 0.65rem;
    color: #0277BD;
    font-weight: 700;
    margin-top: 2px;
  }

  /* Telemetry Bar */
  .telemetry-bar {
    display: flex;
    justify-content: space-around;
    background-color: rgba(27, 43, 31, 0.08);
    border: 1.5px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 6px 12px;
    gap: 8px;
    flex-wrap: wrap;
  }

  .telemetry-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tel-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--journal-ink, #1B2B1F);
  }

  .tel-value {
    font-size: 0.92rem;
    font-weight: 700;
  }

  .tel-value.positive {
    color: #2E7D32;
  }

  .tel-value.negative {
    color: #C62828;
  }

  /* Minigame 2: Toggles Cluster */
  .toggles-cluster {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .toggle-card {
    background: #FFFFFF;
    border: 1.5px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 6px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .toggle-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--journal-forest, #1F3825);
  }

  .segmented-control {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .seg-btn {
    background-color: var(--journal-paper, #FAF6ED);
    border: 1px solid var(--journal-ink, #1B2B1F);
    border-radius: 4px;
    padding: 6px 8px;
    font-size: 0.78rem;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.15s;
    text-align: center;
  }

  .seg-btn.active {
    background-color: var(--journal-gold, #E5A93C);
    border-color: #1B2B1F;
    font-weight: 700;
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
  }

  /* Aquifer Gauge Panel */
  .aquifer-gauge-panel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 8px;
    background: #FFFFFF;
    border: 1.5px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 8px 12px;
  }

  .gauge-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-title {
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--journal-soil, #7C4A2D);
  }

  .stat-number {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .stat-number.safe {
    color: #2E7D32;
  }

  .stat-number.danger {
    color: #C62828;
  }

  .status-badge {
    font-size: 0.74rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
  }

  .status-badge.safe {
    background-color: #E8F5E9;
    color: #2E7D32;
  }

  .status-badge.danger {
    background-color: #FFEBEE;
    color: #C62828;
  }

  .stat-satellite {
    font-size: 0.78rem;
    font-weight: 600;
    color: #0277BD;
  }

  /* Minigame 3: Scenario Dilemmas */
  .scenario-dilemmas {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .dilemma-card {
    background: #FFFFFF;
    border: 1.5px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .dilemma-num {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--journal-forest, #1F3825);
  }

  .dilemma-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .dilemma-btn {
    background-color: var(--journal-paper, #FAF6ED);
    border: 1.5px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 8px 10px;
    cursor: pointer;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 3px;
    transition: background-color 0.15s;
  }

  .dilemma-btn strong {
    font-size: 0.82rem;
    color: var(--journal-forest, #1F3825);
  }

  .dilemma-btn span {
    font-size: 0.74rem;
    color: var(--journal-ink, #1B2B1F);
    line-height: 1.25;
  }

  .dilemma-btn.selected {
    background-color: var(--journal-gold, #E5A93C);
    border-color: #1B2B1F;
    box-shadow: 0 2px 0 var(--journal-ink, #1B2B1F);
  }

  /* Final Chronicle Result */
  .chronicle-summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
  }

  .summary-box {
    background: #FFFFFF;
    border: 1.5px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .box-label {
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--journal-soil, #7C4A2D);
  }

  .box-val {
    font-size: 1.15rem;
    color: var(--journal-forest, #1F3825);
  }

  .box-val.safe {
    color: #2E7D32;
  }

  .box-sub {
    font-size: 0.72rem;
    color: var(--journal-ink, #1B2B1F);
  }

  .ethical-mandate-card {
    background-color: var(--journal-forest, #1F3825);
    color: var(--journal-paper, #FAF6ED);
    padding: 8px 14px;
    border-radius: 4px;
    text-align: center;
    font-size: 0.88rem;
    font-style: italic;
  }

  /* Actions & Callouts */
  .game-actions-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    padding-top: 4px;
  }

  .action-btn {
    background-color: var(--journal-forest, #1F3825);
    color: var(--journal-paper, #FAF6ED);
    border: 2px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
  }

  .action-btn:hover {
    background-color: var(--journal-gold, #E5A93C);
    color: var(--journal-ink, #1B2B1F);
  }

  .action-btn.secondary {
    background-color: transparent;
    color: var(--journal-ink, #1B2B1F);
  }

  .continue-btn {
    background-color: var(--journal-gold, #E5A93C);
    color: var(--journal-ink, #1B2B1F);
    border: 2px solid var(--journal-ink, #1B2B1F);
    border-radius: 6px;
    padding: 8px 18px;
    font-size: 0.92rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 3px 0 var(--journal-ink, #1B2B1F);
  }

  .continue-btn:hover {
    background-color: #FFFFFF;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translate(-50%, 20px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
</style>
