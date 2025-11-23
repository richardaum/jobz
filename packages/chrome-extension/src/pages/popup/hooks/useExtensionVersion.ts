import { useEffect, useState } from "react";

export function useExtensionVersion(): string {
  const [version, setVersion] = useState<string>("0");

  useEffect(() => {
    const loadVersion = async () => {
      try {
        const versionUrl = chrome.runtime.getURL("version.json");
        const response = await fetch(versionUrl);

        if (response.ok) {
          const data = await response.json();
          setVersion(String(data.counter || 0));
        } else {
          const manifestVersion = getManifestVersion();
          setVersion(manifestVersion);
        }
      } catch (error) {
        console.error("Failed to get extension version:", error);
        try {
          const manifestVersion = getManifestVersion();
          setVersion(manifestVersion);
        } catch {
          setVersion("0");
        }
      }
    };

    loadVersion();
  }, []);

  return version;
}

function getManifestVersion() {
  const manifest = chrome.runtime.getManifest();
  const manifestVersion = manifest.version || "0.0.0";
  const parts = manifestVersion.split(".");
  return parts[parts.length - 1] || "0";
}
