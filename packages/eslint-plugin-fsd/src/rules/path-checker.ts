import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/jobz/eslint-plugin-fsd#${name}`);

type Options = [{ alias?: string }];
type MessageIds = "pathViolation";

const LAYERS = ["app", "pages", "widgets", "features", "entities", "shared"] as const;

export const pathChecker = createRule<Options, MessageIds>({
  name: "path-checker",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce relative imports within the same slice",
    },
    messages: {
      pathViolation: "Within a slice, use relative imports instead of absolute imports.",
    },
    schema: [
      {
        type: "object",
        properties: {
          alias: {
            type: "string",
          },
        },
      },
    ],
  },
  defaultOptions: [{}],
  create(context) {
    const alias = context.options[0]?.alias;

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Skip if already relative
        if (importPath.startsWith(".")) return;

        // Skip node_modules
        if (!importPath.match(/^(app|pages|widgets|features|entities|shared)\//)) {
          // If there's an alias, check for that
          if (alias && importPath.startsWith(alias)) {
            // Continue checking
          } else {
            return;
          }
        }

        const filePath = context.filename;

        // Get current file's slice
        const currentSlice = getSliceInfo(filePath);
        if (!currentSlice) return;

        // Get import's slice
        const importSlice = getSliceInfo(importPath);
        if (!importSlice) return;

        // If importing from the same slice, it should be relative
        if (currentSlice.fullPath === importSlice.fullPath) {
          context.report({
            node: node.source,
            messageId: "pathViolation",
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
