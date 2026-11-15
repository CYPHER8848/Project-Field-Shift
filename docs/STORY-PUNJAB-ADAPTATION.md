# Punjab Story Adaptation — Ludhiana-Area Demonstration

This adaptation makes the five-scene story more specific to the project's Punjab simulation while keeping Amma and the farm fictional. It is written for the **Ludhiana-area illustrative point** in `scripts/regions.json`, not for a named village or a real farm. Punjab contains different farming systems and water conditions; this copy must not be presented as universal.

## Regional framing

- Use the familiar **Kharif paddy → Rabi wheat** sequence as the baseline story. The project's Punjab calendar uses approximate regional windows: Kharif weeks 22–42, Rabi weeks 43–16, and a short Zaid/fallow window in weeks 17–21. These are storytelling and prototype calendar windows, not a planting advisory.
- Make water access a question, not an assumption. The story should invite the player to ask whether a fictional field depends on canal water, a tubewell, rainfall, or a mix. Do not imply that a regional weather series measures irrigation availability or groundwater at the farm.
- Keep the comparison aligned with the current simulator: its resilience path keeps rice in Kharif and substitutes chickpea for wheat in Rabi. Do not describe that path as a tested replacement of paddy with maize or another Kharif crop; the current simulation does not model that choice.
- The current app imports `src/lib/mock/weather-punjab.json`. It is synthetic prototype data. Until the app is wired to a verified source dataset, label the display **“illustrative regional weather series (mock data)”** and do not call it NASA POWER observations.

## Scene copy — Punjab variant

### Scene 1 — The inheritance

**Narration**

> When I was small, Amma could read the field in the way the soil held water and the leaves answered the heat. She knew what changed after a shower, and what stayed dry. She never needed one number to tell her the whole story.
>
> Years later, she asked me to help care for the family farm near Ludhiana. I brought questions. She brought a lifetime of noticing this land.

**On-screen line:** A Punjab field holds more than one season.

**Visual direction:** Show a fictional, level field with a low village tree line and an irrigation channel. Avoid recognizable landmarks, real farm boundaries, or a single “typical Punjab” landscape.

### Scene 2 — A familiar rhythm

**Narration**

> On our farm, the work moved with the seasons. Kharif brought the paddy part of our rotation; in the cooler Rabi months, we prepared for wheat. The calendar helped us plan, but Amma always watched the field and listened to people who knew this place.
>
> This is one central-Punjab example. Sowing and harvest dates shift with the year, the field and the farmer’s choices. Choose Punjab to follow this fictional Ludhiana-area story.

**On-screen line:** Kharif paddy. Rabi wheat. One family’s story.

**Helper copy:** This is an illustrative regional example near Ludhiana, not a farm address or a calendar for every Punjab farm.

**Visual direction:** Transition from a monsoon-season paddy illustration to a cooler-season wheat illustration. Use labels for Kharif and Rabi; avoid exact operation dates unless they are supplied by a reviewed local calendar.

### Scene 3 — The present field

**Narration**

> Now it is 2026. A regional weather series can help us look across hot spells, rain and cooler weeks. It cannot tell us how much water reached this field, what is in its soil, or what Amma saw when she walked it.
>
> The weather shown here is an illustrative prototype series for the Ludhiana area. It is not a measurement from Amma’s farm. We need local observations and verified data before drawing conclusions about a real field.

**On-screen labels**

- **Place:** Ludhiana-area regional example
- **Weather:** illustrative mock series in this prototype
- **Not included:** field soil, irrigation access, groundwater, crop management and farmer observations

**Player action:** Select **See the possible paths**.

### Scene 4 — Three paths to compare

Keep the story cards matched to the actual model strategies:

1. **Keep the rhythm — rice then wheat.** Use the model’s existing Kharif rice and Rabi wheat rotation as the comparison baseline. Ask: *What already works for this family, and what would they want to protect?*
2. **Try a Rabi pulse — rice then chickpea.** The prototype substitutes chickpea for wheat in Rabi while keeping rice in Kharif. Present this only as an illustrative model scenario, not an agronomic recommendation. Ask: *What would the family need to check about water, timing, labor, costs and a reliable buyer?*
3. **Compare an input-intensive version — rice then wheat.** This model path keeps the same crops and changes the assumed management and input costs. Do not imply that its modeled income score is a real price, forecast or likely household return. Ask: *Which costs and risks would matter most to this family?*

**Lead-in narration**

> Amma would compare a new idea with what the family already knew. Here, we can compare three simplified model paths. They leave out too much to choose a crop for a real farm, but they can help us name better questions.

**Evidence and uncertainty copy**

> **What this prototype uses:** a regional weekly weather series, crop traits and simplified management assumptions. The Punjab weather file currently connected to the app is mock data.
>
> **What it does not know:** this field’s soil test, water source and reliability, seed, labor, machinery, prices, pests, local advice or household priorities.
>
> **How to read the comparison:** scores show what the prototype’s assumptions produce. They are not measured yields, market returns, probabilities or recommendations.

### Scene 5 — A future to test

**Narration**

> In this 2040 what-if, we can change an assumption and see how the model paths respond. That helps us ask questions; it cannot show what will happen on this farm.
>
> Before trying anything, Amma would want to hear from people who know this field. They would check the water, the soil, the timing, the costs and whether the choice fits the family. The decision would stay with the people who live with it.

**Reflection prompts**

- What would the family want to ask a local farmer or agriculture adviser before comparing wheat and chickpea?
- How reliable is water for this field, and what local information could change the choice?
- What costs, labor, timing or buyer access would the family want to check first?

**Closing line:** Regional data can start a conversation. It cannot make a field-level decision for a farmer.

## Sources and review notes

- The Punjab Agricultural University publishes separate Kharif and Rabi crop practice packages. Use them as references for local review, not as blanket instructions in this fictional story: [PAU Kharif Package of Practices](https://www.pau.edu/content/ccil/pf/pp_kharif.pdf), [PAU Rabi Package of Practices](https://pau.edu/content/ccil/pf/pp_rabi.pdf).
- ICAR describes Punjab’s rice–wheat system and regional differences in water and soil conditions: [ICAR Punjab profile](https://icar.gov.in/index.php/en/node/17283).
- Before presenting the regional calendar as anything beyond a prototype, have a Punjab-based agricultural reviewer confirm the season labels, crop wording, and operational dates. Before displaying source claims, verify the exact weather file connected to the app and expose its source and status in the interface.

## Suggested contribution summary

Added a Punjab-specific, Ludhiana-area story variant aligned to the current simulation paths, with explicit mock-weather wording, regional limitations, and local-review sources. The adaptation does not change the app’s data or make farm recommendations.
