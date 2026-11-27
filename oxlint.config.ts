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
  rules: {
    // Baseline: rules that fail on the current code. Each is either fixed in a
    // follow-up commit (and removed from this list) or kept off with a reason.
    "import/no-namespace": "off",
    "no-console": "off",
    "no-promise-executor-return": "off",
    "quality/no-known-value-widening": "off",
    "quality/no-unsafe-dictionary-type": "off",
    "quality/no-unknown-returns": "off",
    "typescript/array-type": "off",
    "typescript/no-non-null-assertion": "off",
    "typescript/no-unsafe-type-assertion": "off",
    "typescript/use-unknown-in-catch-callback-variable": "off",
    "unicorn/catch-error-name": "off",
    "unicorn/consistent-function-scoping": "off",
    "unicorn/numeric-separators-style": "off",
    "unicorn/prefer-at": "off",
    "unicorn/prefer-import-meta-properties": "off",
    "unicorn/prefer-string-replace-all": "off",
    "unicorn/prefer-top-level-await": "off",
    "@nkzw/no-instanceof": "off",
  },
});
