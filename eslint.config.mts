import pluginJs from "@eslint/js";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

import fsdPlugin from "./packages/eslint-plugin-fsd";

// Type annotation removed to avoid @typescript-eslint/utils RuleModule incompatibility
// See: https://github.com/typescript-eslint/typescript-eslint/issues/10396
const config = [
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/*.config.js", "**/*.config.ts"],
  },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      fsd: fsdPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "fsd/layer-imports": "error",
      "fsd/public-api-imports": "error",
      "fsd/cross-slice-imports": "error",
      "fsd/path-checker": "error",
    },
  },
];

export default config;
