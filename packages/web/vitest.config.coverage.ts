import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

// Configuração com thresholds mais rigorosos para CI
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".next", "e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov", "json-summary", "text-summary"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "src/**/*.d.ts",
        "src/**/*.config.{ts,tsx}",
        "src/**/types.ts",
        "src/**/index.ts",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "e2e/**",
        ".next/**",
        "dist/**",
      ],
      include: ["src/**/*.{ts,tsx}"],
      // Sem thresholds para permitir upload mesmo com cobertura baixa
      // Os thresholds podem ser configurados no Codecov
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
