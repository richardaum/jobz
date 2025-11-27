/**
 * Environment variables configuration
 * Next.js exposes env variables through process.env
 * Variables prefixed with NEXT_PUBLIC_ are exposed to the client
 *
 * To use environment variables:
 * 1. Create a .env.local file in the root of this package
 * 2. Add variables with NEXT_PUBLIC_ prefix: NEXT_PUBLIC_OPENAI_API_KEY=your-key
 * 3. Access them via process.env.NEXT_PUBLIC_OPENAI_API_KEY
 */

export const env = {
  openaiApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
};

