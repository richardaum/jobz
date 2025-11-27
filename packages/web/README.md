# @jobz/web

Next.js web application following Feature-Sliced Design (FSD) architecture.

## Getting Started

```bash
# Install dependencies
bun install

# Set up environment variables
# Create a .env.local file in the root of this package with:
# NEXT_PUBLIC_OPENAI_API_KEY=your-api-key-here

# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

The application requires the following environment variable:

- `NEXT_PUBLIC_OPENAI_API_KEY` - Your OpenAI API key for AI features

Create a `.env.local` file in the root of this package to set these variables. The API key can also be set via localStorage in the browser (using the `setOpenAIApiKey` function from `@/shared/config`).

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
