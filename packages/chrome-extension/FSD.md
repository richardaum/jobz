# Feature Sliced Design (FSD)

## Overview

Feature Sliced Design (FSD) is a methodology for organizing frontend application code. It helps create scalable, maintainable, and understandable codebases by dividing the application into clear layers and segments.

## Core Principles

1. **Layering**: Code is organized into horizontal layers based on business logic importance
2. **Slicing**: Each layer is divided into vertical segments (features, entities, widgets, etc.)
3. **Isolation**: Segments are isolated and can be developed independently
4. **Composition**: Complex components are built by composing simpler ones

## Layer Structure

### 1. **app** (Application Layer)

- Application initialization
- Root components
- Global providers
- Routing configuration
- Global styles

### 2. **processes** (Business Processes)

- Complex multi-step user flows
- Cross-cutting business logic
- Orchestration of multiple features

### 3. **pages** (Application Pages)

- Full page components
- Route handlers
- Page-level composition

### 4. **widgets** (Composite UI Blocks)

- Complex UI components composed of features/entities
- Independent, reusable blocks
- Can contain business logic

### 5. **features** (User Interactions)

- User actions and interactions
- Feature-specific business logic
- UI components specific to a feature

### 6. **entities** (Business Entities)

- Business domain models
- Data structures and types
- Entity-specific logic

### 7. **shared** (Reusable Infrastructure)

- UI kit components
- Utilities and helpers
- API clients
- Constants and configs

## Directory Structure

```
src/
├── app/              # Application setup
├── processes/        # Business processes
├── pages/            # Page components
├── widgets/          # Composite UI blocks
├── features/         # User interactions
├── entities/         # Business entities
└── shared/           # Shared infrastructure
    ├── ui/           # UI components
    ├── lib/          # Utilities
    ├── api/          # API clients
    └── config/       # Configuration
```

## Rules

1. **Import Rules**:
   - Layers can only import from layers below them
   - `app` → `processes` → `pages` → `widgets` → `features` → `entities` → `shared`
   - No circular dependencies

2. **Public API**:
   - Each segment should have a `index.ts` file that exports its public API
   - Internal implementation details should not be exported

3. **Naming**:
   - Use kebab-case for directories
   - Use PascalCase for components
   - Use camelCase for utilities and functions

## Benefits

- **Scalability**: Easy to add new features without affecting existing code
- **Maintainability**: Clear structure makes code easier to understand and modify
- **Team Collaboration**: Different developers can work on different features independently
- **Reusability**: Shared components and utilities are easily accessible
- **Testability**: Isolated segments are easier to test

## Example Structure for Chrome Extension

```
src/
├── app/
│   ├── providers/        # Global providers (theme, etc.)
│   ├── styles/           # Global styles
│   └── index.tsx         # App entry point
├── pages/
│   └── popup/
│       └── index.tsx     # Popup page
├── widgets/
│   └── job-match-result/ # Job matching result widget
├── features/
│   ├── extract-job/      # Extract job description feature
│   └── match-job/        # Match job with resume feature
├── entities/
│   ├── job/              # Job entity
│   └── resume/           # Resume entity
└── shared/
    ├── ui/               # Button, Input, etc.
    ├── api/              # OpenAI client, etc.
    └── lib/              # Utilities
```

## References

- [Feature Sliced Design Official Docs](https://feature-sliced.design/)
- [FSD GitHub](https://github.com/feature-sliced/documentation)
