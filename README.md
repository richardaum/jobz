# Jobz Monorepo

A monorepo for the Jobz project.

## Structure

```
jobz/
├── packages/
│   └── chrome-extension/  # Chrome extension built with Vite
└── package.json
```

## Getting Started

Install dependencies:

```bash
bun install
```

## Development

Run all packages in development mode:

```bash
bun run dev
```

Run a specific package:

```bash
bun run dev:chrome-extension
```

Or run from within the package directory:

```bash
cd packages/chrome-extension
bun run dev
```

## Build

Build all packages:

```bash
bun run build
```

Build a specific package:

```bash
bun run build:chrome-extension
```

## Linting and Formatting

Lint all packages:

```bash
bun run lint
```

Fix linting issues automatically:

```bash
bun run lint:fix
```

Format all files:

```bash
bun run format
```

Check formatting without making changes:

```bash
bun run format:check
```

## Type Checking

Check TypeScript types across all packages:

```bash
bun run type-check
```

## Quality Checks

Run all checks (format, lint, type-check):

```bash
bun run check
```

Fix all auto-fixable issues (format + lint:fix):

```bash
bun run check:fix
```

## Cleanup

Clean build artifacts:

```bash
bun run clean
```

Clean everything including node_modules:

```bash
bun run clean:all
```

## Other Commands

Install all dependencies:

```bash
bun run install:all
# or simply
bun install
```
