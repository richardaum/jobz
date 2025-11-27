#!/usr/bin/env bun

import { spawn } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import ngrok from "@ngrok/ngrok";
import { setTimeout as sleep } from "timers/promises";
import { createServer } from "net";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WEB_PACKAGE_DIR = resolve(__dirname, "..");

const PORT = process.env.PORT || 3000;
const NGROK_AUTH_TOKEN = process.env.NGROK_AUTH_TOKEN;

async function openBrowser(url: string) {
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);

  const platform = process.platform;
  let command: string;

  if (platform === "darwin") {
    command = `open "${url}"`;
  } else if (platform === "win32") {
    command = `start "" "${url}"`;
  } else {
    // Linux and others
    command = `xdg-open "${url}"`;
  }

  try {
    await execAsync(command);
  } catch (error) {
    // Silently fail if browser can't be opened
    console.log("💡 Could not automatically open browser. Please open manually.");
  }
}

async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(port, () => {
      server.once("close", () => resolve(true));
      server.close();
    });
    server.on("error", () => resolve(false));
  });
}

async function killProcess(process: ReturnType<typeof spawn>) {
  try {
    if (!process.killed) {
      // Try graceful shutdown first
      process.kill("SIGTERM");

      // Force kill after a short delay if still running
      await sleep(2000);
      if (!process.killed) {
        process.kill("SIGKILL");
      }
    }
  } catch (error) {
    // Ignore errors when killing
  }
}

async function main() {
  // ngrok auth token is optional if configured globally via `ngrok config add-authtoken`
  const ngrokConfig: { authtoken?: string } = {};
  if (NGROK_AUTH_TOKEN) {
    ngrokConfig.authtoken = NGROK_AUTH_TOKEN;
  }

  let nextProcess: ReturnType<typeof spawn> | null = null;
  let listener: Awaited<ReturnType<typeof ngrok.forward>> | null = null;

  const cleanup = async (exitCode = 0) => {
    console.log("\n🛑 Shutting down...");

    // Close ngrok tunnel
    if (listener) {
      try {
        await listener.close();
        console.log("✅ ngrok tunnel closed");
      } catch (error) {
        console.error("❌ Error closing ngrok:", error);
      }
    }

    // Kill Next.js process
    if (nextProcess) {
      await killProcess(nextProcess);
    }

    process.exit(exitCode);
  };

  // Handle cleanup on exit signals
  process.on("SIGINT", () => cleanup(0));
  process.on("SIGTERM", () => cleanup(0));
  process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught exception:", error);
    cleanup(1);
  });
  process.on("unhandledRejection", (error) => {
    console.error("❌ Unhandled rejection:", error);
    cleanup(1);
  });

  try {
    // Start Next.js dev server
    console.log("🚀 Starting Next.js dev server...");
    nextProcess = spawn("bun", ["x", "next", "dev", "--turbo", "-H", "0.0.0.0", "-p", PORT.toString()], {
      stdio: "inherit",
      shell: true,
      cwd: WEB_PACKAGE_DIR,
      env: { ...process.env },
    });

    // Handle Next.js process errors
    nextProcess.on("error", (error) => {
      console.error("❌ Failed to start Next.js:", error);
      cleanup(1);
    });

    // Check if Next.js exits early (e.g., port already in use)
    const exitPromise = new Promise<void>((resolve) => {
      nextProcess!.on("exit", (code) => {
        if (code !== 0 && code !== null) {
          console.error(`❌ Next.js exited with code ${code}. Port ${PORT} may already be in use.`);
          resolve();
        }
      });
    });

    // Wait for Next.js to be ready (give it a few seconds)
    console.log("⏳ Waiting for Next.js to start...");

    // Race between waiting for startup and checking for early exit
    await Promise.race([
      sleep(5000),
      exitPromise.then(() => {
        throw new Error("Next.js process exited before it could start");
      }),
    ]);

    // Check if Next.js process is still running
    if (nextProcess.killed) {
      throw new Error("Next.js process died before ngrok could start");
    }

    // Start ngrok tunnel
    console.log("🌐 Starting ngrok tunnel...");
    listener = await ngrok.forward({
      addr: PORT,
      ...ngrokConfig,
    });

    const httpsUrl = listener.url();
    if (!httpsUrl) {
      throw new Error("Failed to get ngrok URL");
    }

    console.log("\n✅ ngrok tunnel is active!");
    console.log(`🔗 HTTPS URL: ${httpsUrl}`);
    console.log(`📍 Local URL: http://localhost:${PORT}`);
    console.log("\n💡 Press Ctrl+C to stop both Next.js and ngrok\n");

    // Automatically open browser
    console.log("🌐 Opening browser...");
    await openBrowser(httpsUrl);

    // Keep the process alive by waiting for Next.js to exit
    await new Promise<void>((resolve) => {
      nextProcess!.on("exit", (code) => {
        console.log(`\n⚠️  Next.js process exited with code ${code}`);
        resolve();
      });

      // Also handle if process is already dead
      if (nextProcess!.killed) {
        resolve();
      }
    });

    // Cleanup after Next.js exits
    await cleanup(0);
  } catch (error) {
    console.error("❌ Failed to start ngrok:", error);
    await cleanup(1);
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
