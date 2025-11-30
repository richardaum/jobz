import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, describe, expect, it } from "vitest";

import { getTsConfigPaths, normalizePath } from "./tsconfig";

// Helper to create a temporary tsconfig for testing
function createTempTsConfig(content: Record<string, unknown>, dir?: string): string {
  const tempDir = dir || join(tmpdir(), `eslint-plugin-fsd-test-${Date.now()}`);
  mkdirSync(tempDir, { recursive: true });
  const tsConfigPath = join(tempDir, "tsconfig.json");
  writeFileSync(tsConfigPath, JSON.stringify(content, null, 2));
  return tempDir;
}

// Cleanup helper
function cleanupTempDir(dir: string) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("getTsConfigPaths", () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir) {
      cleanupTempDir(tempDir);
    }
  });

  it("should extract path aliases from tsconfig.json", () => {
    tempDir = createTempTsConfig({
      compilerOptions: {
        paths: {
          "@/*": ["./src/*"],
          "~/*": ["./lib/*"],
        },
      },
    });

    const aliases = getTsConfigPaths(join(tempDir, "tsconfig.json"));
    expect(aliases).toEqual(["@/", "~/"]);
  });

  it("should handle paths with /* suffix", () => {
    tempDir = createTempTsConfig({
      compilerOptions: {
        paths: {
          "@/*": ["./src/*"],
        },
      },
    });

    const aliases = getTsConfigPaths(join(tempDir, "tsconfig.json"));
    expect(aliases).toEqual(["@/"]);
  });

  it("should return empty array if tsconfig doesn't exist", () => {
    const aliases = getTsConfigPaths("/nonexistent/tsconfig.json");
    expect(aliases).toEqual([]);
  });

  it("should return empty array if paths are not defined", () => {
    tempDir = createTempTsConfig({
      compilerOptions: {},
    });

    const aliases = getTsConfigPaths(join(tempDir, "tsconfig.json"));
    expect(aliases).toEqual([]);
  });

  it("should handle extends", () => {
    const baseDir = createTempTsConfig({
      compilerOptions: {
        paths: {
          "@base/*": ["./base/*"],
        },
      },
    });

    const childDir = join(baseDir, "child");
    mkdirSync(childDir, { recursive: true });
    tempDir = createTempTsConfig(
      {
        extends: "../tsconfig.json",
        compilerOptions: {
          paths: {
            "@/*": ["./src/*"],
          },
        },
      },
      childDir
    );

    const aliases = getTsConfigPaths(join(tempDir, "tsconfig.json"));
    // Should merge paths from base and child
    expect(aliases).toContain("@/");
    expect(aliases).toContain("@base/");

    cleanupTempDir(baseDir);
  });

  it("should find tsconfig.json when searching from a directory", () => {
    tempDir = createTempTsConfig({
      compilerOptions: {
        paths: {
          "@/*": ["./src/*"],
        },
      },
    });

    const nestedDir = join(tempDir, "nested", "deep");
    mkdirSync(nestedDir, { recursive: true });

    const aliases = getTsConfigPaths(undefined, nestedDir);
    expect(aliases).toEqual(["@/"]);
  });

  it("should return empty array for invalid JSON", () => {
    tempDir = join(tmpdir(), `eslint-plugin-fsd-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    const tsConfigPath = join(tempDir, "tsconfig.json");
    writeFileSync(tsConfigPath, "invalid json {");

    const aliases = getTsConfigPaths(tsConfigPath);
    expect(aliases).toEqual([]);
  });

  it("should handle baseUrl in tsconfig", () => {
    tempDir = createTempTsConfig({
      compilerOptions: {
        baseUrl: "./src",
        paths: {
          "@/*": ["./src/*"],
        },
      },
    });

    const aliases = getTsConfigPaths(join(tempDir, "tsconfig.json"));
    expect(aliases).toEqual(["@/"]);
  });

  it("should return empty array when no tsconfig found (reaching root)", () => {
    // Use a directory that definitely doesn't have a tsconfig.json
    // We'll use a temp directory without a tsconfig
    const tempDir = join(tmpdir(), `eslint-plugin-fsd-test-${Date.now()}-no-config`);
    mkdirSync(tempDir, { recursive: true });
    const nestedDir = join(tempDir, "nested", "deep", "path");
    mkdirSync(nestedDir, { recursive: true });

    const aliases = getTsConfigPaths(undefined, nestedDir);
    expect(aliases).toEqual([]);

    cleanupTempDir(tempDir);
  });

  it("should use process.cwd() when startDir is undefined in findTsConfig", () => {
    // This tests the branch where startDir is undefined
    // We'll test by not providing startDir, which should use process.cwd()
    // If there's a tsconfig in the current working directory, it should find it
    // Otherwise, it should return empty array
    const aliases = getTsConfigPaths(undefined, undefined);
    // We can't assert the exact value since it depends on where tests are run
    // But we can verify it doesn't throw and returns an array
    expect(Array.isArray(aliases)).toBe(true);
  });
});

describe("normalizePath", () => {
  it("should remove alias prefix from path", () => {
    expect(normalizePath("@/entities/user", ["@/"])).toBe("entities/user");
    expect(normalizePath("@/features/auth", ["@/"])).toBe("features/auth");
  });

  it("should handle multiple aliases", () => {
    expect(normalizePath("@/entities/user", ["@/", "~/"])).toBe("entities/user");
    expect(normalizePath("~/entities/user", ["@/", "~/"])).toBe("entities/user");
  });

  it("should handle longer aliases first", () => {
    expect(normalizePath("@src/entities/user", ["@/", "@src/"])).toBe("entities/user");
    expect(normalizePath("@/entities/user", ["@/", "@src/"])).toBe("entities/user");
  });

  it("should normalize backslashes to forward slashes", () => {
    expect(normalizePath("entities\\user", [])).toBe("entities/user");
  });

  it("should return original path if no alias matches", () => {
    expect(normalizePath("entities/user", ["@/"])).toBe("entities/user");
    expect(normalizePath("lodash", ["@/"])).toBe("lodash");
  });

  it("should handle empty aliases array", () => {
    expect(normalizePath("@/entities/user", [])).toBe("@/entities/user");
  });

  it("should handle Windows-style paths", () => {
    expect(normalizePath("C:\\entities\\user", [])).toBe("C:/entities/user");
  });
});
