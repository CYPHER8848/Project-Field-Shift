import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** Svelte config for tooling (svelte-check, editor extensions).
 *  TypeScript inside <script lang="ts"> is handled natively by the Vite plugin;
 *  vitePreprocess keeps external tooling consistent with it. */
export default {
  preprocess: vitePreprocess()
};
