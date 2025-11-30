# eslint-plugin-fsd

ESLint plugin for Feature-Sliced Design (FSD) architecture.

[![codecov](https://codecov.io/gh/richardaum/jobz/branch/main/graph/badge.svg?flag=eslint-plugin-fsd)](https://codecov.io/gh/richardaum/jobz?flag=eslint-plugin-fsd)

## Installation

```bash
npm install --save-dev eslint-plugin-fsd
# or
yarn add -D eslint-plugin-fsd
# or
pnpm add -D eslint-plugin-fsd
```

## Usage

Add to your ESLint configuration:

```js
// eslint.config.js
import fsdPlugin from "eslint-plugin-fsd";

export default [
  {
    plugins: {
      fsd: fsdPlugin,
    },
    rules: {
      "fsd/layer-imports": "error",
      "fsd/public-api-imports": "error",
      "fsd/cross-slice-imports": "error",
      "fsd/path-checker": "error",
    },
  },
];
```

## Rules

### `layer-imports`

Enforces FSD layer import hierarchy. Lower layers cannot import from higher layers.

**Layers (from lowest to highest):**

- `shared` (0)
- `entities` (1)
- `features` (2)
- `widgets` (3)
- `pages` (4)
- `app` (5)

### `public-api-imports`

Enforces imports from other slices to use the public API (index file).

### `cross-slice-imports`

Prevents cross-imports between slices on the same layer, except via `@x` notation.

### `path-checker`

Enforces relative imports within the same slice.

## Testing

```bash
# Run tests
bun run test

# Run tests with UI
bun run test:ui

# Run tests with coverage
bun run test:coverage

# Run tests once
bun run test:run
```

## Coverage

Test coverage is configured to work with Codecov. Coverage reports are generated in the `coverage/` directory:

- `coverage/lcov.info` - LCOV format for Codecov
- `coverage/coverage-final.json` - JSON format
- `coverage/index.html` - HTML report

### Coverage Thresholds

- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## License

MIT
