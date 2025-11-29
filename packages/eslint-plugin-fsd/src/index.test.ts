import { describe, expect, it } from "vitest";

import plugin from "./index";

describe("eslint-plugin-fsd", () => {
  it("should export plugin with correct meta", () => {
    expect(plugin).toBeDefined();
    expect(plugin.meta).toBeDefined();
    expect(plugin.meta.name).toBe("eslint-plugin-fsd");
    expect(plugin.meta.version).toBe("0.0.1");
  });

  it("should export all rules", () => {
    expect(plugin.rules).toBeDefined();
    expect(plugin.rules["layer-imports"]).toBeDefined();
    expect(plugin.rules["public-api-imports"]).toBeDefined();
    expect(plugin.rules["cross-slice-imports"]).toBeDefined();
    expect(plugin.rules["path-checker"]).toBeDefined();
  });

  it("should have correct rule structure", () => {
    const layerImportsRule = plugin.rules["layer-imports"];
    expect(layerImportsRule.meta).toBeDefined();
    expect(layerImportsRule.meta.type).toBe("problem");
    expect(layerImportsRule.create).toBeDefined();
    expect(typeof layerImportsRule.create).toBe("function");

    const publicApiImportsRule = plugin.rules["public-api-imports"];
    expect(publicApiImportsRule.meta).toBeDefined();
    expect(publicApiImportsRule.meta.type).toBe("problem");
    expect(publicApiImportsRule.create).toBeDefined();
    expect(typeof publicApiImportsRule.create).toBe("function");

    const crossSliceImportsRule = plugin.rules["cross-slice-imports"];
    expect(crossSliceImportsRule.meta).toBeDefined();
    expect(crossSliceImportsRule.meta.type).toBe("problem");
    expect(crossSliceImportsRule.create).toBeDefined();
    expect(typeof crossSliceImportsRule.create).toBe("function");

    const pathCheckerRule = plugin.rules["path-checker"];
    expect(pathCheckerRule.meta).toBeDefined();
    expect(pathCheckerRule.meta.type).toBe("problem");
    expect(pathCheckerRule.create).toBeDefined();
    expect(typeof pathCheckerRule.create).toBe("function");
  });
});
