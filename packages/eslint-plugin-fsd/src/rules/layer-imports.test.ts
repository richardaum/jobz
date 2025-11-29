import parser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";

import { layerImports } from "./layer-imports";

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
ruleTester.run("layer-imports", layerImports as any, {
  valid: [
    // Shared can import from shared
    {
      code: 'import { something } from "shared/utils";',
      filename: "shared/lib/helper.ts",
    },
    // Entities can import from shared
    {
      code: 'import { something } from "shared/utils";',
      filename: "entities/user/model.ts",
    },
    // Features can import from entities and shared
    {
      code: 'import { User } from "entities/user";',
      filename: "features/auth/model.ts",
    },
    {
      code: 'import { something } from "shared/utils";',
      filename: "features/auth/model.ts",
    },
    // Widgets can import from features, entities, and shared
    {
      code: 'import { auth } from "features/auth";',
      filename: "widgets/header/ui.tsx",
    },
    {
      code: 'import { User } from "entities/user";',
      filename: "widgets/header/ui.tsx",
    },
    {
      code: 'import { something } from "shared/utils";',
      filename: "widgets/header/ui.tsx",
    },
    // Pages can import from widgets, features, entities, and shared
    {
      code: 'import { Header } from "widgets/header";',
      filename: "pages/home/page.tsx",
    },
    {
      code: 'import { auth } from "features/auth";',
      filename: "pages/home/page.tsx",
    },
    {
      code: 'import { User } from "entities/user";',
      filename: "pages/home/page.tsx",
    },
    {
      code: 'import { something } from "shared/utils";',
      filename: "pages/home/page.tsx",
    },
    // App can import from all layers
    {
      code: 'import { HomePage } from "pages/home";',
      filename: "app/router.tsx",
    },
    {
      code: 'import { Header } from "widgets/header";',
      filename: "app/router.tsx",
    },
    {
      code: 'import { auth } from "features/auth";',
      filename: "app/router.tsx",
    },
    {
      code: 'import { User } from "entities/user";',
      filename: "app/router.tsx",
    },
    {
      code: 'import { something } from "shared/utils";',
      filename: "app/router.tsx",
    },
    // Relative imports should be ignored
    {
      code: 'import { something } from "./helper";',
      filename: "entities/user/model.ts",
    },
    {
      code: 'import { something } from "../utils";',
      filename: "entities/user/model.ts",
    },
    // Non-FSD imports should be ignored
    {
      code: 'import { something } from "lodash";',
      filename: "entities/user/model.ts",
    },
    {
      code: 'import { something } from "@/external";',
      filename: "entities/user/model.ts",
    },
    // With @/ alias
    {
      code: 'import { something } from "@/shared/utils";',
      filename: "@/entities/user/model.ts",
    },
    {
      code: 'import { User } from "@/entities/user";',
      filename: "@/features/auth/model.ts",
    },
  ],
  invalid: [
    // Shared cannot import from other layers
    {
      code: 'import { User } from "entities/user";',
      filename: "shared/utils.ts",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "shared",
            toLayer: "entities",
          },
        },
      ],
    },
    {
      code: 'import { auth } from "features/auth";',
      filename: "shared/utils.ts",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "shared",
            toLayer: "features",
          },
        },
      ],
    },
    {
      code: 'import { Header } from "widgets/header";',
      filename: "shared/utils.ts",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "shared",
            toLayer: "widgets",
          },
        },
      ],
    },
    {
      code: 'import { HomePage } from "pages/home";',
      filename: "shared/utils.ts",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "shared",
            toLayer: "pages",
          },
        },
      ],
    },
    {
      code: 'import { Router } from "app/router";',
      filename: "shared/utils.ts",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "shared",
            toLayer: "app",
          },
        },
      ],
    },
    // Entities cannot import from features, widgets, pages, app
    {
      code: 'import { auth } from "features/auth";',
      filename: "entities/user/model.ts",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "entities",
            toLayer: "features",
          },
        },
      ],
    },
    {
      code: 'import { Header } from "widgets/header";',
      filename: "entities/user/model.ts",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "entities",
            toLayer: "widgets",
          },
        },
      ],
    },
    {
      code: 'import { HomePage } from "pages/home";',
      filename: "entities/user/model.ts",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "entities",
            toLayer: "pages",
          },
        },
      ],
    },
    {
      code: 'import { Router } from "app/router";',
      filename: "entities/user/model.ts",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "entities",
            toLayer: "app",
          },
        },
      ],
    },
    // Features cannot import from widgets, pages, app
    {
      code: 'import { Header } from "widgets/header";',
      filename: "features/auth/model.ts",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "features",
            toLayer: "widgets",
          },
        },
      ],
    },
    {
      code: 'import { HomePage } from "pages/home";',
      filename: "features/auth/model.ts",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "features",
            toLayer: "pages",
          },
        },
      ],
    },
    {
      code: 'import { Router } from "app/router";',
      filename: "features/auth/model.ts",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "features",
            toLayer: "app",
          },
        },
      ],
    },
    // Widgets cannot import from pages, app
    {
      code: 'import { HomePage } from "pages/home";',
      filename: "widgets/header/ui.tsx",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "widgets",
            toLayer: "pages",
          },
        },
      ],
    },
    {
      code: 'import { Router } from "app/router";',
      filename: "widgets/header/ui.tsx",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "widgets",
            toLayer: "app",
          },
        },
      ],
    },
    // Pages cannot import from app
    {
      code: 'import { Router } from "app/router";',
      filename: "pages/home/page.tsx",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "pages",
            toLayer: "app",
          },
        },
      ],
    },
    // With @/ alias
    {
      code: 'import { User } from "@/entities/user";',
      filename: "@/shared/utils.ts",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "shared",
            toLayer: "entities",
          },
        },
      ],
    },
    {
      code: 'import { auth } from "@/features/auth";',
      filename: "@/entities/user/model.ts",
      errors: [
        {
          messageId: "layerViolation",
          data: {
            fromLayer: "entities",
            toLayer: "features",
          },
        },
      ],
    },
  ],
});
