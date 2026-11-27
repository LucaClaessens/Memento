import cloudflare from "@cloudflare/oxlint-config";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [cloudflare],
  env: {
    ...cloudflare.env,
    // Svelte runes ($state, $props, $derived, $bindable, ...) are globals in .svelte files.
    svelte: true,
  },
  ignorePatterns: [
    ...cloudflare.ignorePatterns,
    "**/.svelte-kit/**",
    "**/.agents/**",
    "**/build/**",
    "**/dist/**",
    "**/coverage/**",
  ],
  overrides: [
    {
      // The API entry point reports startup and shutdown; the preset bans
      // console calls everywhere, including entry points.
      files: ["apps/api/src/index.ts"],
      rules: { "no-console": "off" },
    },
  ],
  rules: {
    // Baseline: rules that fail on the current code. Each is either fixed in a
    // follow-up commit (and removed from this list) or kept off with a reason.
    "import/no-namespace": "off",
    "quality/no-unknown-returns": "off",
    "typescript/no-unsafe-type-assertion": "off",
    "unicorn/prefer-top-level-await": "off",
    "@nkzw/no-instanceof": "off",
  },
});
