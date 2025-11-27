# Package Templates

## Next.js Web Package with FSD Architecture

**Prompt:**

```
create a new web package, it should have a next (latest) app. create a blank one following FSD using @eslint-plugin-fsd. use typescript config files whenever possible. set up the app router properly. use eslint 9.
```

**Key Requirements:**

- Next.js 15 with App Router
- React 19
- TypeScript config files (`.ts` or `.mts`)
- ESLint 9 with flat config
- FSD architecture with `@eslint-plugin-fsd` plugin
- Path aliases: `@/*` → `./src/*`

**Structure:**

```
packages/web/
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mts
└── src/
    ├── app/          # Next.js App Router
    ├── pages/        # FSD pages layer
    ├── widgets/      # FSD widgets layer
    ├── features/     # FSD features layer
    ├── entities/     # FSD entities layer
    └── shared/       # FSD shared layer
```

**Pattern:**

- `src/app/*/page.tsx` imports from `src/pages/*` (FSD layer)
- App Router handles routing, FSD handles business logic
