# Jobz Monorepo

A monorepo for the Jobz project.

## Structure

```
jobz/
├── packages/
│   ├── chrome-extension/  # Chrome extension built with Vite
│   ├── web/              # Next.js web application
│   └── ai/               # AI functions and utilities
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
# Chrome extension
bun run dev:chrome

# Web application
bun run dev:web

# Web application with HTTPS tunnel (ngrok)
bun run dev:web:tunnel
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
bun run build:chrome
bun run build:web
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

## Development with HTTPS (ngrok)

The web application supports running with an HTTPS tunnel using ngrok for free:

1. **Configure ngrok:**
   ```bash
   bunx ngrok config add-authtoken your_token_here
   ```
   Get your free auth token from [dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)

2. **Start the dev server:**
   ```bash
   bun run dev:web
   ```

3. **In a separate terminal, start ngrok:**
   ```bash
   bun run dev:web:ngrok
   ```

   This will automatically open your browser to the HTTPS URL. See [packages/web/README.md](./packages/web/README.md) for more details.

## Other Commands

Install all dependencies:

```bash
bun run install:all
# or simply
bun install
```
