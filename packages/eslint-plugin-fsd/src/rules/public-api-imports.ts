import { ESLintUtils } from "@typescript-eslint/utils";
import { dirname } from "path";

import { getTsConfigPaths, normalizePath } from "../utils/tsconfig";

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/jobz/eslint-plugin-fsd#${name}`);

type Options = [
  {
    aliases?: string[];
    tsconfigPath?: string;
  },
];
type MessageIds = "publicApiViolation";

const LAYERS = ["app", "pages", "widgets", "features", "entities", "shared"] as const;

export const publicApiImports = createRule<Options, MessageIds>({
  name: "public-api-imports",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce imports from other slices to use public API (index)",
    },
    messages: {
      publicApiViolation: "Import from '{{ slice }}' must use the public API. Import from '{{ publicApi }}' instead.",
    },
    schema: [
      {
        type: "object",
        properties: {
          aliases: {
            type: "array",
            items: { type: "string" },
            description:
              "Path aliases to recognize (e.g., ['@/']). If not provided, will try to read from tsconfig.json",
          },
          tsconfigPath: {
            type: "string",
            description: "Path to tsconfig.json file. If not provided, will search for it automatically.",
          },
        },
      },
    ],
  },
  defaultOptions: [{}],
  create(context) {
    const options = context.options[0] || {};
    let aliases = options.aliases;

    // If aliases not provided, try to read from tsconfig
    if (!aliases || aliases.length === 0) {
      // Try to find tsconfig starting from the file's directory
      const fileDir = context.filename ? dirname(context.filename) : undefined;
      aliases = getTsConfigPaths(options.tsconfigPath, fileDir);
      // Fallback to default @/ if nothing found
      if (aliases.length === 0) {
        aliases = ["@/"];
      }
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Skip relative imports
        if (importPath.startsWith(".")) return;

        const filePath = context.filename;

        // Get current file's slice
        const currentSlice = getSliceInfo(filePath, aliases);
        if (!currentSlice) return;

        // Get import's slice
        const importSlice = getSliceInfo(importPath, aliases);
        if (!importSlice) return;

        // Skip if same slice
        if (currentSlice.fullPath === importSlice.fullPath) return;

        // Check if importing from internal path of another slice
        const isInternalImport = checkInternalImport(importPath, importSlice, aliases);

        if (isInternalImport) {
          const publicApiPath = importSlice.fullPath;

          context.report({
            node: node.source,
            messageId: "publicApiViolation",
            data: {
              slice: importSlice.fullPath,
              publicApi: publicApiPath,
            },
          });
        }
      },
    };
  },
});

interface SliceInfo {
  layer: string;
  slice: string;
  fullPath: string;
}

function getSliceInfo(filePath: string, aliases: string[]): SliceInfo | null {
  // Normalize path by removing aliases
  const normalizedPath = normalizePath(filePath, aliases);

  for (const layer of LAYERS) {
    const layerPattern = new RegExp(`^(${layer})/([^/]+)`);
    const match = normalizedPath.match(layerPattern);

    if (match) {
      return {
        layer: match[1],
        slice: match[2],
        fullPath: `${match[1]}/${match[2]}`,
      };
    }
  }

  return null;
}

function checkInternalImport(importPath: string, sliceInfo: SliceInfo, aliases: string[]): boolean {
  // Normalize the import path (strip alias prefixes) before checking
  const normalizedImportPath = normalizePath(importPath, aliases);

  // Remove the slice path from import to see what's after
  const afterSlice = normalizedImportPath.replace(sliceInfo.fullPath, "");

  // If there's a path after the slice (not just the slice itself or slice/index)
  if (afterSlice && !afterSlice.match(/^\/(index)?$/)) {
    // Check if it's not an @x notation (which is allowed)
    if (!afterSlice.startsWith("/@x/")) {
      return true;
    }
  }

  return false;
}
