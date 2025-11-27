import { useEffect, useRef, useState } from "react";

import { JobExtractorFactory } from "@/features/extract-job";
import { useMatchingStore } from "@/features/match-job";
import { devtools } from "@/shared/chrome-api";
import { logger } from "@/shared/utils/logger";
import { sendTabMessage } from "@/shared/utils/messaging";
import { ensureContentScriptReady } from "@/shared/utils/scripting";

import { formatExtractionError } from "../utils/formatExtractionError";

const RETRY_INTERVAL_MS = 3000; // 3 seconds

export function useAutoJobExtraction() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const job = useMatchingStore((state) => state.job);
  const tabId = devtools.getInspectedTabId();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    setIsExtracting(true);
    setHasError(false);
    setErrorMessage(null);
    setIsRetrying(false);
    setAttemptCount(0);

    logger.info("[Auto Job Extraction] Starting auto extraction");

    const extractJob = async (): Promise<boolean> => {
      if (!isMountedRef.current) {
        logger.debug("[Auto Job Extraction] Component unmounted, skipping extraction");
        return false;
      }

      setAttemptCount((prev) => {
        const newAttempt = prev + 1;
        logger.info(`[Auto Job Extraction] Attempt ${newAttempt}`);
        return newAttempt;
      });
      setHasError(false);
      setErrorMessage(null);

      try {
        // Get URL from inspected window
        const url = await devtools.getInspectedUrl();
        logger.debug(`[Auto Job Extraction] Inspected URL: ${url}`);

        // Check if URL is valid for content scripts
        if (devtools.isRestrictedUrl(url)) {
          logger.warn(`[Auto Job Extraction] Restricted URL detected: ${url}`);
          setHasError(true);
          setErrorMessage("Content scripts cannot run on this page. Please navigate to a regular webpage.");
          return false;
        }

        // Ensure content script is ready
        logger.debug("[Auto Job Extraction] Ensuring content script is ready");
        const injectStart = Date.now();
        const injectError = await ensureContentScriptReady(tabId);
        if (injectError) {
          logger.error(
            `[Auto Job Extraction] Content script injection failed: ${injectError} (${Date.now() - injectStart}ms)`
          );
          setHasError(true);
          setErrorMessage(injectError);
          return false;
        }
        logger.debug(`[Auto Job Extraction] Content script ready (${Date.now() - injectStart}ms)`);

        // Extract job from page
        logger.info("[Auto Job Extraction] Sending extraction request to content script");
        const extractStart = Date.now();
        const response = await sendTabMessage(tabId, {
          action: JobExtractorFactory.ACTION,
        });
        logger.debug(`[Auto Job Extraction] Received response (${Date.now() - extractStart}ms)`, {
          success: response?.success,
          hasJob: !!response?.job,
          error: response?.error,
        });

        // Check if we have a valid job with actual data
        const hasValidJob =
          response?.success &&
          response?.job &&
          response.job.description &&
          response.job.description !== "No description available" &&
          response.job.description.length > 50; // Minimum reasonable description length

        if (hasValidJob && response.job) {
          logger.info(
            `[Auto Job Extraction] Valid job extracted: Source: ${response.job.source}, Description length: ${response.job.description.length} chars`
          );
          // Update job in store
          const { setJob } = useMatchingStore.getState();
          setJob(response.job);
          setIsExtracting(false);
          setIsRetrying(false);
          setHasError(false);
          setErrorMessage(null);
          return true;
        }

        // If we have a job but it's not valid, or if extraction failed
        // Format error message using extraction metadata from the job
        const job = response?.job;

        // Debug: log response to help diagnose missing metadata
        if (!job?.extractionMetadata) {
          logger.warn("[Auto Job Extraction] Job missing extractionMetadata:", {
            hasJob: !!job,
            hasMetadata: !!job?.extractionMetadata,
            responseSuccess: response?.success,
            responseError: response?.error,
            jobSource: job?.source,
          });
        } else {
          logger.debug("[Auto Job Extraction] Job extraction metadata:", {
            usedSelector: job.extractionMetadata.usedSelector,
            failedSelectorsCount: job.extractionMetadata.failedSelectors?.length || 0,
            descriptionLength: job.description?.length || 0,
          });
        }

        const errorMsg = formatExtractionError(response?.error, job);
        logger.warn(`[Auto Job Extraction] Job extraction failed or invalid: ${errorMsg.substring(0, 100)}...`);

        setHasError(true);
        setErrorMessage(errorMsg);
        return false;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
        logger.error(`[Auto Job Extraction] Unexpected error: ${errorMsg}`, error);
        setHasError(true);
        setErrorMessage(`Unexpected error: ${errorMsg}`);
        return false;
      }
    };

    // Start extraction immediately
    extractJob().then((success) => {
      if (!success && isMountedRef.current) {
        logger.info(
          `[Auto Job Extraction] Initial extraction failed, starting retry mechanism (every ${RETRY_INTERVAL_MS}ms)`
        );
        setIsRetrying(true);
        // If failed, retry every 3 seconds until success
        intervalRef.current = setInterval(async () => {
          if (!isMountedRef.current) {
            logger.debug("[Auto Job Extraction] Component unmounted, stopping retry");
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            return;
          }

          // Check if job was already extracted (maybe by another process)
          const currentJob = useMatchingStore.getState().job;
          if (currentJob) {
            logger.info("[Auto Job Extraction] Job found in store, stopping retry");
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setIsExtracting(false);
            setIsRetrying(false);
            setHasError(false);
            setErrorMessage(null);
            return;
          }

          logger.debug("[Auto Job Extraction] Retrying extraction");
          const success = await extractJob();
          if (success && intervalRef.current) {
            logger.info("[Auto Job Extraction] Extraction succeeded, stopping retry");
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsRetrying(false);
          }
        }, RETRY_INTERVAL_MS);
      } else if (success) {
        logger.info("[Auto Job Extraction] Initial extraction succeeded");
        setIsRetrying(false);
      }
    });

    return () => {
      logger.debug("[Auto Job Extraction] Cleaning up, component unmounting");
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tabId]);

  // Stop retrying if job is successfully extracted
  useEffect(() => {
    if (job && intervalRef.current) {
      logger.info("[Auto Job Extraction] Job extracted, stopping retry mechanism");
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsExtracting(false);
      setIsRetrying(false);
      setHasError(false);
      setErrorMessage(null);
    }
  }, [job]);

  return { isExtracting, attemptCount, hasError, errorMessage, isRetrying };
}
