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
      // Test fixtures narrow `Response.json()` (typed `any` by lib.dom) to the
      // error body they expect; the preset already relaxes unsafe rules in tests.
      files: ["**/*.{test,spec}.{ts,tsx}"],
      rules: { "typescript/no-unsafe-type-assertion": "off" },
    },
    {
      // The API entry point reports startup and shutdown; the preset bans
      // console calls everywhere, including entry points.
      files: ["apps/api/src/index.ts"],
      rules: {
        "no-console": "off",
        // The model preload deliberately does not block `serve`; awaiting it
        // top-level would delay the first request instead of warming it.
        "unicorn/prefer-top-level-await": "off",
      },
    },
    {
      // shadcn-svelte components expose namespace imports (`import * as Alert`)
      // for compound components; that is the library's documented API.
      files: ["apps/web/src/**/*.svelte"],
      rules: { "import/no-namespace": "off" },
    },
    {
      // The client returns unparsed JSON; each feature validates it with the
      // shared zod schema at its own boundary. Returning `unknown` is the point.
      files: ["apps/web/src/lib/api/client.ts"],
      rules: { "quality/no-unknown-returns": "off" },
    },
  ],
  rules: {
    // Kept off on purpose. Each entry states why the rule does not fit.
    //
    // TypeScript's only way to narrow `unknown` to an error or a DOM class
    // (`File`) is `instanceof`; the rule cannot be satisfied without casts.
    "@nkzw/no-instanceof": "off",
  },
});
