/**
 * Environment variables configuration
 * Vite exposes env variables through import.meta.env
 * Variables prefixed with VITE_ are exposed to the client
 *
 * To use environment variables:
 * 1. Create a .env file in the root of this package
 * 2. Add variables with VITE_ prefix: VITE_OPENAI_API_KEY=your-key
 * 3. Access them via import.meta.env.VITE_OPENAI_API_KEY
 */

export const env = {
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
  nodeEnv: import.meta.env.MODE || "development",
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
