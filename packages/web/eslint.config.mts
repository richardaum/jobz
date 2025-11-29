import { FlatCompat } from "@eslint/eslintrc";
import pluginJs from "@eslint/js";
import globals from "globals";
import jiti from "jiti";
import { dirname } from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use jiti to load TypeScript files
const jitiLoader = jiti(__dirname);
const fsdPlugin = jitiLoader("../../eslint-plugin-fsd/src/index.ts");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Type annotation removed to avoid @typescript-eslint/utils RuleModule incompatibility
// See: https://github.com/typescript-eslint/typescript-eslint/issues/10396
const eslintConfig = [
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/out/**",
      "**/*.config.js",
      "**/*.config.ts",
      "**/next-env.d.ts",
    ],
  },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  // Next.js configs via FlatCompat (for now, until Next.js fully supports flat config)
  // Only extend core-web-vitals to avoid plugin redefinition
  ...compat.extends("next/core-web-vitals"),
  {
    plugins: {
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
      "fsd/layer-imports": "error",
      "fsd/public-api-imports": "error",
      "fsd/cross-slice-imports": "error",
      "fsd/path-checker": "error",
    },
  },
];

export default eslintConfig;

