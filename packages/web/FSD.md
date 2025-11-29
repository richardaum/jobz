# Feature Sliced Design (FSD)

## Overview

Feature Sliced Design (FSD) is a methodology for organizing frontend application code. It helps create scalable, maintainable, and understandable codebases by dividing the application into clear layers and segments.

This project uses FSD architecture with Next.js App Router, which has some specific considerations documented below.

## Core Principles

1. **Layering**: Code is organized into horizontal layers based on business logic importance
2. **Slicing**: Each layer is divided into vertical segments (features, entities, widgets, etc.)
3. **Isolation**: Segments are isolated and can be developed independently
4. **Composition**: Complex components are built by composing simpler ones

## Layer Structure

### 1. **app** (Application Layer)

- Application initialization
- Root components (`layout.tsx`)
- Global providers
- **Next.js App Router**: Route handlers and page components (`page.tsx`, `error.tsx`, `not-found.tsx`)
- Global styles (`globals.css`)

> **Note**: In Next.js App Router, the `app/` directory serves dual purpose: application setup and routing. Route segments (like `about/page.tsx`) are part of the app layer.

### 2. **processes** (Business Processes)

- Complex multi-step user flows
- Cross-cutting business logic
- Orchestration of multiple features

> **Note**: Currently empty, available for future complex workflows.

### 3. **widgets** (Composite UI Blocks)

- Complex UI components composed of features/entities
- Independent, reusable blocks
- Can contain business logic

> **Note**: Currently empty, available for future composite components.

### 4. **features** (User Interactions)

- User actions and interactions
- Feature-specific business logic
- UI components specific to a feature
- Feature-specific hooks, stores, and utilities

**Typical Feature Structure**:

```
features/
└── feature-name/
    ├── index.ts              # Public API exports
    ├── feature-name.tsx      # Main feature component
    ├── components/           # Feature-specific components
    ├── hooks/                # Feature-specific hooks
    ├── stores/               # Feature-specific state management
    └── utils/                # Feature-specific utilities
```

### 5. **entities** (Business Entities)

- Business domain models
- Data structures and types
- Entity-specific logic

> **Note**: Currently empty, available for future domain entities.

### 6. **shared** (Reusable Infrastructure)

- UI kit components (`ui/`)
- Shared components (`components/`)
- Utilities and helpers (`lib/`)
- API clients (`api/`)
- Configuration (`config/`)
- Shared hooks (`hooks/`)
- Shared stores (`stores/`)

**Shared Structure**:

```
shared/
├── ui/           # UI kit components (Button, Card, Dialog, etc.)
├── components/   # Shared composite components
├── lib/          # Utility functions
├── api/          # API clients
├── config/       # Configuration files
├── hooks/        # Shared React hooks
└── stores/       # Shared state stores
```

## Directory Structure

```
src/
├── app/              # Application setup & Next.js routes
│   ├── page.tsx      # Home page
│   ├── layout.tsx    # Root layout
│   ├── providers/    # Global providers
│   └── ...
├── processes/        # Business processes (empty, available)
├── widgets/          # Composite UI blocks (empty, available)
├── features/         # User interactions
│   └── resume-agent/
│       ├── index.ts
│       ├── resume-agent.tsx
│       ├── components/
│       ├── hooks/
│       ├── stores/
│       └── utils/
├── entities/         # Business entities (empty, available)
└── shared/           # Shared infrastructure
    ├── ui/           # UI kit components
    ├── components/   # Shared components
    ├── lib/          # Utilities
    ├── api/          # API clients
    ├── config/       # Configuration
    ├── hooks/        # Shared hooks
    └── stores/       # Shared stores
```

## Rules

### 1. **Import Rules**

- Layers can only import from layers below them
- Import order: `app` → `processes` → `widgets` → `features` → `entities` → `shared`
- No circular dependencies
- No cross-slice imports within the same layer

**Valid Import Examples**:

```typescript
// ✅ Feature importing from shared
import { Button } from "@/shared/ui";
import { copyToClipboard } from "@/shared/lib";

// ✅ App importing from features
import { ResumeAgent } from "@/features/resume-agent";

// ❌ Shared importing from features (violation)
import { ResumeAgent } from "@/features/resume-agent"; // ERROR
```

### 2. **Public API**

- Each segment should have an `index.ts` file that exports its public API
- Internal implementation details should not be exported
- Always import from the segment's `index.ts`, not from internal files

**Example**:

```typescript
// ✅ Correct: Import from public API
import { ResumeAgent, useResumeStore } from "@/features/resume-agent";

// ❌ Incorrect: Direct import from internal file
import { ResumeAgent } from "@/features/resume-agent/resume-agent"; // ERROR
```

### 3. **Naming Conventions**

- Use **kebab-case** for directories: `resume-agent`, `job-match`
- Use **PascalCase** for components: `ResumeAgent`, `JobMatchButton`
- Use **camelCase** for utilities and functions: `formatForPDF`, `useResumeStore`

### 4. **Path Aliases**

The project uses TypeScript path aliases configured in `tsconfig.json`:

- `@/*` maps to `src/*`
- Use `@/` prefix for all internal imports

**Example**:

```typescript
import { Button } from "@/shared/ui";
import { ResumeAgent } from "@/features/resume-agent";
```

## Enforcement

FSD rules are automatically enforced via ESLint using a custom `eslint-plugin-fsd`:

- `fsd/layer-imports`: Ensures correct layer import order
- `fsd/public-api-imports`: Enforces public API usage
- `fsd/cross-slice-imports`: Prevents cross-slice imports
- `fsd/path-checker`: Validates import paths

These rules are configured in `eslint.config.mts` and will show errors during development and in CI/CD.

## Next.js App Router Considerations

- The `app/` directory serves as both the application layer and Next.js routing layer
- Route segments (e.g., `app/about/page.tsx`) are part of the app layer
- Use `"use client"` directive for client components in features and shared
- Server components can be used in the `app/` layer

## References

- [Feature Sliced Design Official Docs](https://feature-sliced.design/)
- [FSD GitHub](https://github.com/feature-sliced/documentation)
- [Next.js App Router](https://nextjs.org/docs/app)
