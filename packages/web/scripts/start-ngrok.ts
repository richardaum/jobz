#!/usr/bin/env bun

import ngrok from "@ngrok/ngrok";
import { connect } from "net";
import { setTimeout as sleep } from "timers/promises";

const PORT = process.env.PORT || 3000;
const NGROK_AUTH_TOKEN = process.env.NGROK_AUTH_TOKEN;

async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const client = connect(port, "localhost", () => {
      client.end();
      resolve(true);
    });
    client.on("error", () => resolve(false));
    setTimeout(() => {
      client.destroy();
      resolve(false);
    }, 1000);
  });
}

async function openBrowser(url: string) {
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);

  const command =
    process.platform === "darwin"
      ? `open "${url}"`
      : process.platform === "win32"
        ? `start "" "${url}"`
        : `xdg-open "${url}"`;

  try {
    await execAsync(command);
  } catch {
    // Silently fail
  }
}

async function keepAlive() {
  // Keep the process running indefinitely
  // This will wait forever until the process is terminated by SIGINT/SIGTERM
  while (true) {
    await sleep(1000);
  }
}

async function main() {
  // Check port
  if (!(await isPortInUse(Number(PORT)))) {
    console.error(`❌ Port ${PORT} is not in use!`);
    console.error(`   Start the server first: bun run dev:web`);
    process.exit(1);
  }

  // Start ngrok
  const listener = await ngrok.forward({
    addr: PORT,
    ...(NGROK_AUTH_TOKEN && { authtoken: NGROK_AUTH_TOKEN }),
  });

  const httpsUrl = listener.url();
  if (!httpsUrl) {
    console.error("❌ Failed to get ngrok URL");
    process.exit(1);
  }

  console.log("\n✅ ngrok tunnel active!");
  console.log(`🔗 ${httpsUrl}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log("\n💡 Press Ctrl+C to stop\n");

  await openBrowser(httpsUrl);

  // Setup cleanup on exit
  process.on("SIGINT", async () => {
    await listener.close();
    process.exit(0);
  });

  // Keep the script running
  await keepAlive();
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
