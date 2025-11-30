import parser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, expect, it } from "vitest";

import { publicApiImports } from "./public-api-imports";

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

// @ts-expect-error - Type incompatibility between @typescript-eslint/utils versions
// This is a known issue when using @typescript-eslint/rule-tester with different versions
ruleTester.run("public-api-imports", publicApiImports, {
  valid: [
    // Relative imports are ignored
    {
      code: 'import { helper } from "./lib/helper";',
      filename: "entities/user/model.ts",
    },
    {
      code: 'import { helper } from "../lib/helper";',
      filename: "entities/user/ui/component.tsx",
    },
    // Public API imports (index) are allowed
    {
      code: 'import { User } from "entities/user";',
      filename: "features/auth/model.ts",
    },
    {
      code: 'import { User } from "entities/user/index";',
      filename: "features/auth/model.ts",
    },
    {
      code: 'import { auth } from "features/auth";',
      filename: "widgets/header/ui.tsx",
    },
    // @x notation is allowed
    {
      code: 'import { User } from "entities/user/@x/user";',
      filename: "entities/profile/model.ts",
    },
    {
      code: 'import { Product } from "entities/product/@x/product";',
      filename: "entities/user/model.ts",
    },
    // Same slice imports are ignored
    {
      code: 'import { helper } from "entities/user/lib/helper";',
      filename: "entities/user/model.ts",
    },
    // Non-FSD imports are ignored
    {
      code: 'import { something } from "lodash";',
      filename: "entities/user/model.ts",
    },
    {
      code: 'import { something } from "react";',
      filename: "entities/user/model.ts",
    },
    // With @/ alias
    {
      code: 'import { User } from "@/entities/user";',
      filename: "@/features/auth/model.ts",
    },
    {
      code: 'import { User } from "@/entities/user/index";',
      filename: "@/features/auth/model.ts",
    },
    // With custom aliases option
    {
      code: 'import { User } from "entities/user";',
      filename: "features/auth/model.ts",
      options: [{ aliases: ["@/"] }],
    },
    // File not in FSD layer structure should be ignored
    {
      code: 'import { helper } from "entities/user/lib/helper";',
      filename: "some/random/path.ts",
    },
    {
      code: 'import { User } from "entities/user";',
      filename: "some/random/path.ts",
    },
    // Test case with empty filename to cover falsy filename branch
    {
      code: 'import { User } from "entities/user";',
      filename: "",
    },
  ],
  invalid: [
    // Internal imports from other slices should use public API
    {
      code: 'import { helper } from "entities/user/lib/helper";',
      filename: "features/auth/model.ts",
      errors: [
        {
          messageId: "publicApiViolation",
          data: {
            slice: "entities/user",
            publicApi: "entities/user",
          },
        },
      ],
    },
    {
      code: 'import { types } from "entities/user/types";',
      filename: "features/auth/model.ts",
      errors: [
        {
          messageId: "publicApiViolation",
          data: {
            slice: "entities/user",
            publicApi: "entities/user",
          },
        },
      ],
    },
    {
      code: 'import { component } from "features/auth/ui/component";',
      filename: "widgets/header/ui.tsx",
      errors: [
        {
          messageId: "publicApiViolation",
          data: {
            slice: "features/auth",
            publicApi: "features/auth",
          },
        },
      ],
    },
    {
      code: 'import { model } from "entities/user/model";',
      filename: "features/auth/model.ts",
      errors: [
        {
          messageId: "publicApiViolation",
          data: {
            slice: "entities/user",
            publicApi: "entities/user",
          },
        },
      ],
    },
    {
      code: 'import { nested } from "entities/user/lib/utils/helper";',
      filename: "features/auth/model.ts",
      errors: [
        {
          messageId: "publicApiViolation",
          data: {
            slice: "entities/user",
            publicApi: "entities/user",
          },
        },
      ],
    },
    // With @/ alias
    {
      code: 'import { helper } from "@/entities/user/lib/helper";',
      filename: "@/features/auth/model.ts",
      errors: [
        {
          messageId: "publicApiViolation",
          data: {
            slice: "entities/user",
            publicApi: "entities/user",
          },
        },
      ],
    },
    {
      code: 'import { types } from "@/entities/user/types";',
      filename: "@/features/auth/model.ts",
      errors: [
        {
          messageId: "publicApiViolation",
          data: {
            slice: "entities/user",
            publicApi: "entities/user",
          },
        },
      ],
    },
    // With custom aliases option
    {
      code: 'import { helper } from "entities/user/lib/helper";',
      filename: "features/auth/model.ts",
      options: [{ aliases: ["@/"] }],
      errors: [
        {
          messageId: "publicApiViolation",
          data: {
            slice: "entities/user",
            publicApi: "entities/user",
          },
        },
      ],
    },
  ],
});

// Direct test for falsy filename branch coverage
describe("public-api-imports edge cases", () => {
  it("should handle undefined filename", () => {
    const rule = publicApiImports;

    const context = {
      filename: undefined,
      options: [{}],
      report: () => {},
    } as unknown as Parameters<typeof rule.create>[0];

    const ruleContext = rule.create(context);
    // Use a relative import which should be skipped early, avoiding the getSliceInfo call

    const node = {
      source: { value: "./helper" },
    } as Parameters<NonNullable<ReturnType<typeof rule.create>["ImportDeclaration"]>>[0];

    // This should not throw - relative imports are skipped before getSliceInfo is called
    expect(() => {
      ruleContext.ImportDeclaration?.(node);
    }).not.toThrow();
  });

  it("should handle null filename", () => {
    const rule = publicApiImports;

    const context = {
      filename: null,
      options: [{}],
      report: () => {},
    } as unknown as Parameters<typeof rule.create>[0];

    const ruleContext = rule.create(context);
    // Use a relative import which should be skipped early

    const node = {
      source: { value: "./helper" },
    } as Parameters<NonNullable<ReturnType<typeof rule.create>["ImportDeclaration"]>>[0];

    expect(() => {
      ruleContext.ImportDeclaration?.(node);
    }).not.toThrow();
  });
});
