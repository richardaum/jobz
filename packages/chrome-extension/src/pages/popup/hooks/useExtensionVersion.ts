import { useEffect, useState } from "react";

export function useExtensionVersion(): string {
  const [version, setVersion] = useState<string>("0");

  useEffect(() => {
    const loadVersion = async () => {
      try {
        // Try to load version.json from dist (contains the counter)
        const versionUrl = chrome.runtime.getURL("version.json");
        const response = await fetch(versionUrl);

        if (response.ok) {
          const data = await response.json();
          setVersion(String(data.counter || 0));
        } else {
          // Fallback to manifest version if version.json doesn't exist
          const manifest = chrome.runtime.getManifest();
          const manifestVersion = manifest.version || "0.0.0";
          // Extract patch version (last number) as counter
          const parts = manifestVersion.split(".");
          setVersion(parts[parts.length - 1] || "0");
        }
      } catch (error) {
        console.error("Failed to get extension version:", error);
        // Fallback to manifest version
        try {
          const manifest = chrome.runtime.getManifest();
          const manifestVersion = manifest.version || "0.0.0";
          const parts = manifestVersion.split(".");
          setVersion(parts[parts.length - 1] || "0");
        } catch {
          setVersion("0");
        }
      }
    };

    loadVersion();
  }, []);

  return version;
}
