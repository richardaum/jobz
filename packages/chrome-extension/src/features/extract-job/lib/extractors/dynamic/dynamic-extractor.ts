import type { JobDescription } from "@/entities/job";
import { logger } from "@/shared/utils/logger";

import { BaseJobExtractor } from "../base/base-extractor";
import { configs } from "./configs";
import type { DynamicExtractorConfig } from "./types";

export class DynamicExtractor extends BaseJobExtractor {
  private matchedConfig: DynamicExtractorConfig | null = null;

  canExtract(url: string): boolean {
    for (const config of configs) {
      if (url.includes(config.urlPattern)) {
        this.matchedConfig = config;
        return true;
      }
    }
    return false;
  }

  async extract(): Promise<JobDescription> {
    const failedSelectors: string[] = [];
    let title = "Unknown Title";
    let company = "Unknown Company";
    let description = "No description available";
    let usedSelector = "none";

    try {
      if (!this.matchedConfig) {
        logger.warn("[DynamicExtractor] No config matched for URL:", this.getCurrentUrl());
        // Return job with error info instead of throwing
        return {
          title,
          company,
          description,
          source: "dynamic",
          url: this.getCurrentUrl(),
          extractedAt: new Date().toISOString(),
          extractionMetadata: {
            usedSelector: "none",
            isCollection: false,
            failedSelectors: ["No config matched for this URL"],
          },
        };
      }

      logger.debug(`[DynamicExtractor] Using config: ${this.matchedConfig.name} for URL: ${this.getCurrentUrl()}`);
      const { selectors } = this.matchedConfig;
      title = this.getText(selectors.title) || "Unknown Title";
      company = this.getText(selectors.company) || "Unknown Company";

      logger.debug(`[DynamicExtractor] Title: "${title}", Company: "${company}"`);

      // Track all selectors we'll try
      const allSelectors: string[] = [];
      if (selectors.title) allSelectors.push(`title: ${selectors.title}`);
      if (selectors.company) allSelectors.push(`company: ${selectors.company}`);
      if (selectors.description) allSelectors.push(selectors.description);

      if (selectors.description) {
        try {
          logger.debug(`[DynamicExtractor] Trying description selector: ${selectors.description}`);
          let element = document.querySelector(selectors.description);

          // If selector failed and contains escaped colons, try alternative approaches
          if (!element && selectors.description.includes("\\:")) {
            logger.debug(`[DynamicExtractor] Selector with escaped colon failed, trying alternative approaches`);
            // Try unescaping the colon (for cases where JSON already escaped it)
            const unescapedSelector = selectors.description.replace(/\\:/g, ":");
            try {
              element = document.querySelector(unescapedSelector);
              if (element) {
                logger.debug(`[DynamicExtractor] Found element using unescaped selector`);
              }
            } catch (e) {
              // Ignore
            }

            // If still not found, try using attribute selector for classes with colons
            if (!element) {
              const classParts = selectors.description.split(".").filter((p) => p && !p.includes(":"));
              if (classParts.length > 0) {
                // Try finding element by common classes (without the responsive variants)
                const fallbackSelector = "." + classParts.join(".");
                try {
                  element = document.querySelector(fallbackSelector);
                  if (element) {
                    logger.debug(`[DynamicExtractor] Found element using fallback selector: ${fallbackSelector}`);
                  }
                } catch (e) {
                  // Ignore
                }
              }
            }
          }

          if (element) {
            logger.debug(`[DynamicExtractor] Found description element`);
            const extractedText = this.extractCleanText(element);
            logger.debug(
              `[DynamicExtractor] Extracted text length: ${extractedText.length}, preview: ${extractedText.substring(0, 100)}...`
            );
            if (extractedText && this.isValidJobDescription(extractedText)) {
              description = extractedText;
              usedSelector = selectors.description;
              logger.info(`[DynamicExtractor] Successfully extracted description (${extractedText.length} chars)`);
            } else {
              const reason = !extractedText
                ? "empty text"
                : extractedText.length < 100
                  ? `too short (${extractedText.length} chars, need 100+)`
                  : "failed validation (missing keywords)";
              logger.warn(`[DynamicExtractor] Description selector found element but ${reason}`);
              failedSelectors.push(`${selectors.description} (${reason})`);
            }
          } else {
            logger.warn(`[DynamicExtractor] Description selector not found: ${selectors.description}`);
            failedSelectors.push(selectors.description);
          }
        } catch (error) {
          logger.error(`[DynamicExtractor] Error with description selector: ${error}`);
          failedSelectors.push(`${selectors.description} (error: ${error})`);
        }
      }

      // Track title and company selectors if they failed
      if (selectors.title && !this.getText(selectors.title)) {
        logger.warn(`[DynamicExtractor] Title selector not found: ${selectors.title}`);
        failedSelectors.push(`title: ${selectors.title}`);
      }
      if (selectors.company && !this.getText(selectors.company)) {
        logger.warn(`[DynamicExtractor] Company selector not found: ${selectors.company}`);
        failedSelectors.push(`company: ${selectors.company}`);
      }

      if (!description || description === "No description available") {
        // If we didn't find a valid description, include all selectors tried in failedSelectors
        if (failedSelectors.length === 0 && allSelectors.length > 0) {
          failedSelectors.push(...allSelectors);
        }
      }
    } catch (error) {
      // If any unexpected error occurs, ensure we still return a job with error info
      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ""}`
          : String(error);
      failedSelectors.push(`Extraction error: ${errorMessage}`);
    }

    return {
      title,
      company,
      description,
      source: "dynamic",
      url: this.getCurrentUrl(),
      extractedAt: new Date().toISOString(),
      extractionMetadata: {
        usedSelector,
        isCollection: false,
        failedSelectors,
      },
    };
  }

  private getText(selector?: string): string {
    if (!selector) return "";
    try {
      // Escape CSS selector properly - handle classes with colons (e.g., sm:text-4xl)
      // In JSON, we store sm\\:text-4xl which becomes sm\:text-4xl when parsed
      // But querySelector needs the backslash escaped, so we need sm\\:text-4xl in the string
      // However, if the selector already has escaped colons from JSON, we should use it as-is
      // Let's try the selector as-is first, and if it fails, try to fix common issues
      let element = document.querySelector(selector);

      // If selector failed and contains escaped colons, try unescaping and re-escaping properly
      if (!element && selector.includes("\\:")) {
        // Replace \\: with : temporarily to see the actual class name
        const unescaped = selector.replace(/\\:/g, ":");
        logger.debug(`[DynamicExtractor] Selector with escaped colon failed, trying alternative: ${unescaped}`);
        // Try using attribute selector as fallback
        const classParts = selector.split(".").filter((p) => p);
        if (classParts.length > 0) {
          const attributeSelector = `[class*="${classParts[classParts.length - 1].replace(/\\:/g, ":")}"]`;
          element = document.querySelector(attributeSelector);
          if (element) {
            logger.debug(`[DynamicExtractor] Found element using attribute selector fallback`);
          }
        }
      }

      if (!element) {
        logger.debug(`[DynamicExtractor] Selector not found: ${selector}`);
        return "";
      }
      const text = element.textContent?.trim() || "";
      logger.debug(
        `[DynamicExtractor] Selector "${selector}" found text: "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`
      );
      return text;
    } catch (error) {
      logger.error(`[DynamicExtractor] Error with selector "${selector}": ${error}`);
      return "";
    }
  }
}
