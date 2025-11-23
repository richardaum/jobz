import { useEffect, useState } from "react";

import type { JobDescription } from "@/entities/job";
import type { MatchResult } from "@/features/match-job";
import { getCachedMatch } from "@/shared/lib/match-cache";

interface UseCacheCheckParams {
  onCacheFound: (result: MatchResult) => void;
  onNoCache: () => void;
  onError: (error: string) => void;
}

export function useCacheCheck({ onCacheFound, onNoCache, onError }: UseCacheCheckParams) {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkCache = async () => {
      setIsChecking(true);
      try {
        // Get current tab
        let tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];

        if (!tab?.id || !tab?.url) {
          const tabs = await chrome.tabs.query({ active: true });
          tab = tabs[0];
        }

        if (!tab?.id || !tab?.url) {
          const allTabs = await chrome.tabs.query({});
          tab =
            allTabs.find((t) => t.url && !t.url.startsWith("chrome://") && !t.url.startsWith("chrome-extension://")) ||
            allTabs[0];
        }

        if (!tab?.id || !tab?.url) {
          setIsChecking(false);
          return;
        }

        // Check if URL is valid for content scripts
        if (
          tab.url?.startsWith("chrome://") ||
          tab.url?.startsWith("chrome-extension://") ||
          tab.url?.startsWith("about:")
        ) {
          setIsChecking(false);
          return;
        }

        // Check if content script is available
        let contentScriptReady = false;
        try {
          const pingResponse = await chrome.tabs.sendMessage(tab.id, { action: "ping" });
          contentScriptReady = pingResponse?.success === true;
        } catch (error) {
          contentScriptReady = false;
        }

        if (!contentScriptReady) {
          // Try to inject content script
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ["src/content.js"],
            });
            await new Promise((resolve) => setTimeout(resolve, 200));
          } catch (injectError) {
            setIsChecking(false);
            return;
          }
        }

        // Extract job from page
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: "extractJob",
        });

        if (!response || !response.success || !response.job) {
          setIsChecking(false);
          return;
        }

        const job: JobDescription = response.job;

        // Check cache
        const cachedResult = await getCachedMatch(job);

        if (cachedResult) {
          onCacheFound(cachedResult);
        } else {
          onNoCache();
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        onError(error);
      } finally {
        setIsChecking(false);
      }
    };

    checkCache();
  }, [onCacheFound, onNoCache, onError]);

  return { isChecking };
}
