import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/jobz/eslint-plugin-fsd#${name}`);

type Options = [];
type MessageIds = "layerViolation";

const LAYERS = ["app", "pages", "widgets", "features", "entities", "shared"] as const;
const LAYER_HIERARCHY: Record<string, number> = {
  app: 5,
  pages: 4,
  widgets: 3,
  features: 2,
  entities: 1,
  shared: 0,
};

export const layerImports = createRule<Options, MessageIds>({
  name: "layer-imports",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce FSD layer import hierarchy",
    },
    messages: {
      layerViolation:
        "Layer '{{ fromLayer }}' cannot import from '{{ toLayer }}'. Lower layers cannot import from higher layers.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const filePath = context.filename;

        // Extract layer from current file
        const currentLayer = getLayer(filePath);
        if (!currentLayer) return;

        // Extract layer from import path
        const importLayer = getLayer(importPath);
        if (!importLayer) return;

        // Check hierarchy
        const currentLevel = LAYER_HIERARCHY[currentLayer];
        const importLevel = LAYER_HIERARCHY[importLayer];

        if (currentLevel < importLevel) {
          context.report({
            node: node.source,
            messageId: "layerViolation",
            data: {
              fromLayer: currentLayer,
              toLayer: importLayer,
            },
          });
        }
      },
    };
  },
});

function getLayer(filePath: string): string | null {
  // Strip @/ alias prefix
  const normalizedPath = filePath.replace(/\\/g, "/").replace(/^@\//, "");

  for (const layer of LAYERS) {
    const layerPattern = new RegExp(`^(${layer})/`);
    if (layerPattern.test(normalizedPath)) {
      return layer;
    }
  }

  return null;
}
