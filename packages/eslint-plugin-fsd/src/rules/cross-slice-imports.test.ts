import parser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";

import { crossSliceImports } from "./cross-slice-imports";

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
ruleTester.run("cross-slice-imports", crossSliceImports as any, {
  valid: [
    // Different layers are allowed
    {
      code: 'import { User } from "entities/user";',
      filename: "features/auth/model.ts",
    },
    {
      code: 'import { auth } from "features/auth";',
      filename: "widgets/header/ui.tsx",
    },
    // Same slice is allowed
    {
      code: 'import { helper } from "entities/user/lib/helper";',
      filename: "entities/user/model.ts",
    },
    // Relative imports are ignored
    {
      code: 'import { helper } from "./lib/helper";',
      filename: "entities/user/model.ts",
    },
    {
      code: 'import { helper } from "../user/lib/helper";',
      filename: "entities/user/model.ts",
    },
    // Non-FSD imports are ignored
    {
      code: 'import { something } from "lodash";',
      filename: "entities/user/model.ts",
    },
    // Valid @x-notation (cross-import with correct notation)
    // @x path should match the CURRENT slice (the one doing the import)
    {
      code: 'import { User } from "entities/user/@x/profile";',
      filename: "entities/profile/model.ts",
    },
    {
      code: 'import { Product } from "entities/product/@x/user";',
      filename: "entities/user/model.ts",
    },
    // With @/ alias
    {
      code: 'import { User } from "@/entities/user";',
      filename: "@/features/auth/model.ts",
    },
    {
      code: 'import { User } from "@/entities/user/@x/profile";',
      filename: "@/entities/profile/model.ts",
    },
    // File not in FSD layer structure should be ignored
    {
      code: 'import { User } from "entities/user";',
      filename: "some/random/path.ts",
    },
    {
      code: 'import { User } from "entities/profile";',
      filename: "some/random/path.ts",
    },
  ],
  invalid: [
    // Cross-import without @x-notation (same layer, different slice)
    {
      code: 'import { User } from "entities/user";',
      filename: "entities/profile/model.ts",
      errors: [
        {
          messageId: "crossImportViolation",
          data: {
            fromSlice: "entities/profile",
            toSlice: "entities/user",
          },
        },
      ],
    },
    {
      code: 'import { auth } from "features/auth";',
      filename: "features/login/model.ts",
      errors: [
        {
          messageId: "crossImportViolation",
          data: {
            fromSlice: "features/login",
            toSlice: "features/auth",
          },
        },
      ],
    },
    {
      code: 'import { Header } from "widgets/header";',
      filename: "widgets/sidebar/ui.tsx",
      errors: [
        {
          messageId: "crossImportViolation",
          data: {
            fromSlice: "widgets/sidebar",
            toSlice: "widgets/header",
          },
        },
      ],
    },
    {
      code: 'import { HomePage } from "pages/home";',
      filename: "pages/about/page.tsx",
      errors: [
        {
          messageId: "crossImportViolation",
          data: {
            fromSlice: "pages/about",
            toSlice: "pages/home",
          },
        },
      ],
    },
    // Invalid @x-notation (wrong slice name in @x path)
    {
      code: 'import { User } from "entities/user/@x/wrong";',
      filename: "entities/profile/model.ts",
      errors: [
        {
          messageId: "invalidCrossNotation",
          data: {
            fromSlice: "entities/profile",
            importPath: "entities/user/@x/wrong",
            expectedPath: "entities/user/@x/profile",
          },
        },
      ],
    },
    {
      code: 'import { Product } from "entities/product/@x/user";',
      filename: "entities/cart/model.ts",
      errors: [
        {
          messageId: "invalidCrossNotation",
          data: {
            fromSlice: "entities/cart",
            importPath: "entities/product/@x/user",
            expectedPath: "entities/product/@x/cart",
          },
        },
      ],
    },
    // With @/ alias
    {
      code: 'import { User } from "@/entities/user";',
      filename: "@/entities/profile/model.ts",
      errors: [
        {
          messageId: "crossImportViolation",
          data: {
            fromSlice: "entities/profile",
            toSlice: "entities/user",
          },
        },
      ],
    },
    {
      code: 'import { User } from "@/entities/user/@x/wrong";',
      filename: "@/entities/profile/model.ts",
      errors: [
        {
          messageId: "invalidCrossNotation",
          data: {
            fromSlice: "entities/profile",
            importPath: "@/entities/user/@x/wrong",
            expectedPath: "@/entities/user/@x/profile",
          },
        },
      ],
    },
  ],
});
