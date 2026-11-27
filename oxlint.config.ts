import cloudflare from "@cloudflare/oxlint-config";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [cloudflare],
  env: {
    ...cloudflare.env,
    // Svelte runes ($state, $props, $derived, $bindable, ...) are globals in .svelte files.
    //
    // Oxlint lints only the <script> block of a .svelte file. Template rules from
    // eslint-plugin-svelte (require-each-key, no-unused-props, ...) have no oxlint
    // equivalent; `svelte-check` and the Svelte autofixer cover compile and a11y
    // problems instead. This is the deliberate trade-off of the migration (#48).
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
    {
      // `parseBody()` yields a DOM `File`; `instanceof File` is the only
      // narrowing TypeScript offers for that value.
      files: ["apps/api/src/routes/transcription.ts"],
      rules: { "@nkzw/no-instanceof": "off" },
    },
  ],
  rules: {
    // Keep the old ESLint coverage: unused arguments and caught errors are
    // errors unless their name starts with `_`.
    "no-unused-vars": [
      "error",
      {
        args: "after-used",
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
  },
});
