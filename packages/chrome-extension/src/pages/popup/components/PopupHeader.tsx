import { useEffect, useState } from "react";

import { Badge, Button } from "@/shared/ui";

import { useExtensionVersion } from "../hooks/useExtensionVersion";

export function PopupHeader() {
  const version = useExtensionVersion();
  const [isDetached, setIsDetached] = useState(false);

  useEffect(() => {
    // Check if popup is already detached
    const checkIfDetached = async () => {
      try {
        const currentWindow = await chrome.windows.getCurrent();
        // If window type is "popup" and it's not the default popup, it's detached
        // Also check if there's no opener (window.opener is null)
        if (currentWindow.type === "popup" && !window.opener) {
          setIsDetached(true);
        }
      } catch (error) {
        // If we can't get window info, assume it's not detached
        setIsDetached(false);
      }
    };

    checkIfDetached();
  }, []);

  const handleDetach = async () => {
    try {
      // Get the current popup URL - check manifest to get the correct path
      const manifest = chrome.runtime.getManifest();
      const popupPath = manifest.action?.default_popup || "src/popup.html";
      const popupUrl = chrome.runtime.getURL(popupPath);

      // Create a new window with the popup content
      await chrome.windows.create({
        url: popupUrl,
        type: "popup",
        width: 400,
        height: 600,
      });

      // Close the current popup
      window.close();
    } catch (error) {
      console.error("Failed to detach popup:", error);
    }
  };

  return (
    <header className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
      <h1 className="text-xl font-bold">Jobz - Job Matcher</h1>
      <div className="flex items-center gap-2">
        {!isDetached && (
          <Button onClick={handleDetach} variant="secondary" className="text-xs px-2 py-1" title="Detach">
            ⛶
          </Button>
        )}
        <span className="text-xs text-gray-500">Version:</span>
        <Badge variant="primary" className="font-mono">
          {version}
        </Badge>
      </div>
    </header>
  );
}
