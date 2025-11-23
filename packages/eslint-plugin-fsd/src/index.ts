import { crossSliceImports } from "./rules/cross-slice-imports";
import { layerImports } from "./rules/layer-imports";
import { pathChecker } from "./rules/path-checker";
import { publicApiImports } from "./rules/public-api-imports";

// Don't use type annotations - ESLint 9 will validate structure at runtime
// See: https://github.com/typescript-eslint/typescript-eslint/issues/10396
const plugin = {
  meta: {
    name: "eslint-plugin-fsd",
    version: "0.0.1",
  },
  rules: {
    "layer-imports": layerImports,
    "public-api-imports": publicApiImports,
    "cross-slice-imports": crossSliceImports,
    "path-checker": pathChecker,
  },
};

export default plugin;
