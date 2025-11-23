import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/jobz/eslint-plugin-fsd#${name}`);

type Options = [];
type MessageIds = "crossImportViolation" | "invalidCrossNotation";

const LAYERS = ["app", "pages", "widgets", "features", "entities", "shared"] as const;

export const crossSliceImports = createRule<Options, MessageIds>({
  name: "cross-slice-imports",
  meta: {
    type: "problem",
    docs: {
      description: "Prevent cross-imports between slices on the same layer, except via @x-notation",
    },
    messages: {
      crossImportViolation:
        "Cross-import detected: '{{ fromSlice }}' cannot import from '{{ toSlice }}' on the same layer. Use @x-notation if necessary (primarily for entities layer).",
      invalidCrossNotation:
        "Invalid @x-notation: '{{ fromSlice }}' is importing from '{{ importPath }}', but the @x path should be '{{ expectedPath }}'.",
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

        // Check if it's a cross-import (same layer, different slice)
        if (currentSlice.layer === importSlice.layer && currentSlice.slice !== importSlice.slice) {
          // Check if using @x-notation
          const crossNotationMatch = importPath.match(/@x\/([^/]+)/);

          if (crossNotationMatch) {
            // Validate that @x path matches current slice name
            const targetSlice = crossNotationMatch[1];

            if (targetSlice !== currentSlice.slice) {
              const expectedPath = importPath.replace(`@x/${targetSlice}`, `@x/${currentSlice.slice}`);

              context.report({
                node: node.source,
                messageId: "invalidCrossNotation",
                data: {
                  fromSlice: currentSlice.fullPath,
                  importPath,
                  expectedPath,
                },
              });
            }
            // Valid @x-notation, allow it
          } else {
            // No @x-notation, report violation
            context.report({
              node: node.source,
              messageId: "crossImportViolation",
              data: {
                fromSlice: currentSlice.fullPath,
                toSlice: importSlice.fullPath,
              },
            });
          }
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
