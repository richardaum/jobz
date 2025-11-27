import { useEffect, useState } from "react";

import { JobExtractorFactory } from "@/features/extract-job";
import { getCachedMatch, type MatchResult } from "@/features/match-job";
import { devtools } from "@/shared/chrome-api";
import { sendTabMessage } from "@/shared/utils/messaging";
import { ensureContentScriptReady } from "@/shared/utils/scripting";

interface UseCacheCheckParams {
  onCacheFound: (result: MatchResult) => void;
  onNoCache: () => void;
  onError: (error: string) => void;
}

export function useCacheCheck({ onCacheFound, onNoCache, onError }: UseCacheCheckParams) {
  const [isChecking, setIsChecking] = useState(true);
  const tabId = devtools.getInspectedTabId();

  useEffect(() => {
    const checkCache = async () => {
      setIsChecking(true);
      try {
        // Get URL from inspected window
        const url = await devtools.getInspectedUrl();

        // Check if URL is valid for content scripts
        if (devtools.isRestrictedUrl(url)) {
          setIsChecking(false);
          return;
        }

        // Ensure content script is ready
        const injectError = await ensureContentScriptReady(tabId);
        if (injectError) {
          setIsChecking(false);
          return;
        }

        // Extract job from page
        const response = await sendTabMessage(tabId, {
          action: JobExtractorFactory.ACTION,
        });

        if (!response || !response.success || !response.job) {
          setIsChecking(false);
          return;
        }

        // Check cache
        const cachedResult = await getCachedMatch(response.job);

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
  }, [tabId, onCacheFound, onNoCache, onError]);

  return { isChecking };
}
