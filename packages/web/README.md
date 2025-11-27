# @jobz/web

Next.js web application following Feature-Sliced Design (FSD) architecture.

## Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

This project follows Feature-Sliced Design (FSD) methodology. See [FSD.md](./FSD.md) for more details.

## Structure

```
src/
├── app/              # Application setup
├── processes/        # Business processes
├── pages/            # Page components
├── widgets/          # Composite UI blocks
├── features/         # User interactions
├── entities/         # Business entities
└── shared/           # Shared infrastructure
```
