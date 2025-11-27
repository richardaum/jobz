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

### Development with HTTPS (ngrok)

To expose your local development server with HTTPS for free:

1. **Configure ngrok (choose one method):**
   
   **Option A: Global configuration (recommended)**
   ```bash
   bunx ngrok config add-authtoken your_token_here
   ```
   Get your free auth token from [dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)

   **Option B: Environment variable**
   ```bash
   export NGROK_AUTH_TOKEN=your_token_here
   ```

2. **Start the development server:**
   ```bash
   # From the web package
   bun run dev

   # Or from the root
   bun run dev:web
   ```

3. **In a separate terminal, start ngrok tunnel:**
   ```bash
   # From the web package
   bun run dev:ngrok

   # Or from the root
   bun run dev:web:ngrok
   ```

   This will:
   - Create an ngrok HTTPS tunnel pointing to `http://localhost:3000`
   - **Automatically open your browser** to the HTTPS URL
   - Display the public HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

The HTTPS URL can be shared or used for testing webhooks, OAuth callbacks, or any feature that requires HTTPS.

## Configuration

The OpenAI API key can be configured via the Settings modal in the application. The API key is stored in your browser's local storage and is never shared with any server except OpenAI's API.

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
