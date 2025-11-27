/**
 * Environment variables configuration
 * Next.js exposes env variables through process.env
 * Variables prefixed with NEXT_PUBLIC_ are exposed to the client
 */

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
};
