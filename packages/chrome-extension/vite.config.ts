import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import webExtension from "vite-plugin-web-extension";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manifest path for the plugin
const manifestPath = resolve(__dirname, "./src/manifest.json");
// Temp file to track version state
const versionStatePath = resolve(__dirname, ".version-state.json");

interface VersionState {
  counter: number;
  lastIncrementTime: number;
}

// Plugin to auto-increment version on build restart (watch mode)
function autoVersionPlugin(): Plugin {
  let isWatchMode = false;

  const readVersionState = (): VersionState => {
    try {
      if (existsSync(versionStatePath)) {
        const content = readFileSync(versionStatePath, "utf-8");
        return JSON.parse(content);
      }
    } catch (error) {
      // Ignore
    }
    return { counter: 0, lastIncrementTime: 0 };
  };

  const writeVersionState = (state: VersionState) => {
    try {
      writeFileSync(versionStatePath, JSON.stringify(state, null, 2) + "\n", "utf-8");
    } catch (error) {
      console.error("[AutoVersion] Failed to write state:", error);
    }
  };

  const incrementVersion = () => {
    try {
      // Read current counter
      const state = readVersionState();
      const newCounter = state.counter + 1;

      // Read manifest
      const manifestContent = readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(manifestContent);

      // Parse version (e.g., "0.0.0" -> [0, 0, 0])
      const versionParts = manifest.version.split(".").map(Number);

      // Use counter as patch version
      versionParts[2] = newCounter;

      // Reconstruct version string
      manifest.version = versionParts.join(".");

      // Write back to manifest
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf-8");

      // Update state with new counter
      writeVersionState({
        counter: newCounter,
        lastIncrementTime: Date.now(),
      });

      // Copy version.json to dist
      copyVersionToDist();

      console.log(`[AutoVersion] v${manifest.version} (${newCounter})`);
    } catch (error) {
      console.error("[AutoVersion] ❌ Failed to increment version:", error);
    }
  };

  const copyVersionToDist = () => {
    try {
      const state = readVersionState();
      const distVersionPath = resolve(__dirname, "./dist/version.json");
      const distDir = resolve(__dirname, "./dist");

      // Ensure dist directory exists
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true });
      }

      // Write version.json with just the counter
      writeFileSync(distVersionPath, JSON.stringify({ counter: state.counter }, null, 2) + "\n", "utf-8");
    } catch (error) {
      console.error("[AutoVersion] Failed to copy version to dist:", error);
    }
  };

  return {
    name: "auto-version",
    configResolved(config) {
      // Check if we're in watch mode
      isWatchMode = config.command === "build" && config.build.watch !== null;
    },
    buildStart() {
      // Copy version at build start
      copyVersionToDist();
    },
    buildEnd() {
      // Copy version at build end
      copyVersionToDist();
    },
    watchChange(id, change) {
      if (!isWatchMode) return;

      // Ignore manifest.json, dist, node_modules, and the state file itself
      if (
        !id ||
        id.includes("manifest.json") ||
        id.includes("dist/") ||
        id.includes("node_modules") ||
        id.includes(".version-state.json")
      ) {
        return;
      }

      // Increment immediately (only throttle to prevent too frequent increments)
      const state = readVersionState();
      const now = Date.now();

      // Throttle: only increment if at least 2 seconds have passed since last increment
      if (now - state.lastIncrementTime >= 2000) {
        incrementVersion();
      }
    },
  };
}

// Plugin to copy icons from src/icons to public/icons (Vite copies public/ automatically)
function copyIconsPlugin(): Plugin {
  const copyIcons = () => {
    const iconsSrc = resolve(__dirname, "./src/icons");
    const iconsDest = resolve(__dirname, "./public/icons");
    const sizes = [16, 32, 48, 128];

    if (!existsSync(iconsDest)) {
      mkdirSync(iconsDest, { recursive: true });
    }

    for (const size of sizes) {
      const src = resolve(iconsSrc, `icon-${size}.png`);
      const dest = resolve(iconsDest, `icon-${size}.png`);
      if (existsSync(src)) {
        copyFileSync(src, dest);
      }
    }
  };

  return {
    name: "copy-icons",
    buildStart() {
      copyIcons();
    },
    configureServer(server) {
      // Copy icons when dev server starts
      copyIcons();
    },
    buildEnd() {
      copyIcons();
    },
  };
}

export default defineConfig(({ mode }) => {
  // Let the plugin handle CSP automatically - it knows how to configure it for Manifest V3
  return {
    plugins: [
      react({
        // React Refresh will be handled by the web extension plugin
        jsxRuntime: "automatic",
      }),
      autoVersionPlugin(), // Auto-increment version on build restart
      webExtension({
        manifest: manifestPath,
        watchFilePaths: ["./src/**/*"],
        disableAutoLaunch: true,
      }),
      copyIconsPlugin(), // Copy icons after web-extension processes
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      // Disable minification for better debugging
      minify: false,
      // Enable source maps for better debugging
      sourcemap: true,
      rollupOptions: {
        output: {
          // Use relative paths for Chrome extension
          assetFileNames: "[name][extname]",
        },
      },
      watch: {
        // Explicitly watch src directory and all subdirectories
        include: ["src/**/*"],
        // Exclude node_modules and dist from watching
        exclude: ["node_modules/**", "dist/**"],
      },
    },
    base: "./",
    // Server config for dev mode
    server: {
      strictPort: false, // Allow port changes
      hmr: false, // Disable HMR - use page reload instead (simpler for Manifest V3)
    },
  };
});
