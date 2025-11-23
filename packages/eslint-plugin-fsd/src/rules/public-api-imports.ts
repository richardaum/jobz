import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/jobz/eslint-plugin-fsd#${name}`);

type Options = [];
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
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Skip relative imports
        if (importPath.startsWith(".")) return;

        const filePath = context.filename;

        // Get current file's slice
        const currentSlice = getSliceInfo(filePath);
        if (!currentSlice) return;

        // Get import's slice
        const importSlice = getSliceInfo(importPath);
        if (!importSlice) return;

        // Skip if same slice
        if (currentSlice.fullPath === importSlice.fullPath) return;

        // Check if importing from internal path of another slice
        const isInternalImport = checkInternalImport(importPath, importSlice);

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

function getSliceInfo(filePath: string): SliceInfo | null {
  // Strip @/ alias prefix
  const normalizedPath = filePath.replace(/\\/g, "/").replace(/^@\//, "");

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

function checkInternalImport(importPath: string, sliceInfo: SliceInfo): boolean {
  // Remove the slice path from import to see what's after
  const afterSlice = importPath.replace(sliceInfo.fullPath, "");

  // If there's a path after the slice (not just the slice itself or slice/index)
  if (afterSlice && !afterSlice.match(/^\/(index)?$/)) {
    // Check if it's not an @x notation (which is allowed)
    if (!afterSlice.startsWith("/@x/")) {
      return true;
    }
  }

  return false;
}
