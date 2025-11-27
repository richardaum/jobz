import type { JobDescription } from "@/entities/job";
import { logger } from "@/shared/utils/logger";

import { BaseJobExtractor } from "../base/base-extractor";

export class LinkedInCollectionExtractor extends BaseJobExtractor {
  protected enabled: boolean = false; // Disabled - only DynamicExtractor is enabled
  private iframeDocument: Document | null = null;

  canExtract(url: string): boolean {
    // Check for LinkedIn jobs search or collection pages
    const isLinkedInJobs = url.includes("linkedin.com/jobs/");
    const isSearchOrCollection = url.includes("/jobs/search") || url.includes("/jobs/collections/");
    const hasCurrentJobId = url.includes("currentJobId");

    // Also check window.location in case URL passed doesn't match but we're on a LinkedIn jobs page
    let windowUrlMatches = false;
    try {
      const windowUrl = window.location.href;
      windowUrlMatches =
        windowUrl.includes("linkedin.com/jobs/") &&
        (windowUrl.includes("/jobs/search") ||
          windowUrl.includes("/jobs/collections/") ||
          windowUrl.includes("currentJobId"));
    } catch (e) {
      // Ignore if window is not available
    }

    const matches = (isLinkedInJobs && (isSearchOrCollection || hasCurrentJobId)) || windowUrlMatches;

    if (matches) {
      logger.info(`[LinkedInCollectionExtractor] canExtract=true for URL: ${url}`);
    }

    return matches;
  }

  async extract(): Promise<JobDescription> {
    let title = "Unknown Title";
    let company = "Unknown Company";
    let description = "No description available";
    let usedSelector = "none";
    let failedSelectors: string[] = [];

    try {
    // Wait a bit for iframe to load if it exists
    await this.waitForIframe();

    // Try to get the iframe document first
    this.iframeDocument = this.getIframeDocument();

      title = this.extractTitle();
      company = this.extractCompany();
      const result = this.extractDescription();
      description = result.description || "No description available";
      usedSelector = result.usedSelector || "none";
      failedSelectors = result.failedSelectors || [];
    } catch (error) {
      // If any unexpected error occurs, ensure we still return a job with error info
      const errorMessage = error instanceof Error 
        ? `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`
        : String(error);
      failedSelectors.push(`Extraction error: ${errorMessage}`);
    }

    return {
      title,
      company,
      description,
      source: "linkedin",
      url: this.getCurrentUrl(),
      extractedAt: new Date().toISOString(),
      extractionMetadata: {
        usedSelector,
        isCollection: true,
        failedSelectors,
      },
    };
  }

  /**
   * Extract primary description container (location, date, promotional info)
   */
  private extractPrimaryDescription(): { text: string; selector: string; triedSelectors: string[] } {
    const selectors = [
      ".job-details-jobs-unified-top-card__primary-description-container",
      ".job-details-jobs-unified-top-card__tertiary-description-container",
      "[class*='primary-description-container']",
      "[class*='tertiary-description-container']",
    ];

    // Try in iframe first, then main document
    const docs = this.iframeDocument ? [this.iframeDocument, document] : [document];

    for (const doc of docs) {
      for (const selector of selectors) {
        try {
          const element = doc.querySelector(selector);
          if (element) {
            const text = this.extractTextFromElement(element);
            if (text && text.length >= 5) {
              logger.info(`[LinkedInCollectionExtractor] Found primary description with selector: ${selector}`);
              return { text, selector, triedSelectors: selectors };
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }
    }

    logger.warn("[LinkedInCollectionExtractor] Primary description not found");
    return { text: "", selector: "", triedSelectors: selectors };
  }

  /**
   * Extract fit level preferences (Hybrid, Full-time, Remote, etc.)
   */
  private extractFitLevelPreferences(): { text: string; selector: string; triedSelectors: string[] } {
    const selectors = [".job-details-fit-level-preferences", "[class*='fit-level-preferences']"];

    // Try in iframe first, then main document
    const docs = this.iframeDocument ? [this.iframeDocument, document] : [document];

    for (const doc of docs) {
      for (const selector of selectors) {
        try {
          const element = doc.querySelector(selector);
          if (element) {
            const text = this.extractTextFromElement(element);
            if (text && text.length >= 3) {
              logger.info(`[LinkedInCollectionExtractor] Found fit level preferences with selector: ${selector}`);
              return { text, selector, triedSelectors: selectors };
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }
    }

    logger.warn("[LinkedInCollectionExtractor] Fit level preferences not found");
    return { text: "", selector: "", triedSelectors: selectors };
  }

  /**
   * Extract main job description content
   */
  private extractMainJobDescription(): { text: string; selector: string; triedSelectors: string[] } {
    // Based on the HTML structure, the main description is in:
    // #job-details or .jobs-description-content__text--stretch
    // which is inside .jobs-description__container > .jobs-description__content

    const selectors = [
      "#job-details",
      ".jobs-description-content__text--stretch",
      ".jobs-box__html-content",
      ".jobs-description-content__text",
      ".jobs-description__content",
      ".jobs-description__container",
    ];

    for (const selector of selectors) {
      const element = this.querySelector(selector);
      if (element) {
        const cleanText = this.extractCleanText(element);
        if (cleanText && this.isValidJobDescription(cleanText)) {
          return { text: cleanText, selector, triedSelectors: selectors };
        }
      }
    }

    // Fallback: try to find within .jobs-search__job-details wrapper
    const wrapper = this.querySelector(".jobs-search__job-details--wrapper, .jobs-search__job-details--container");
    if (wrapper) {
      // Look for the description within the wrapper
      const descElement = wrapper.querySelector(
        "#job-details, .jobs-description-content__text--stretch, .jobs-box__html-content"
      );
      if (descElement) {
        const cleanText = this.extractCleanText(descElement);
        if (cleanText && this.isValidJobDescription(cleanText)) {
          return { text: cleanText, selector: "wrapper > description", triedSelectors: selectors };
        }
      }
    }

    // Last resort: try .jobs-details section
    const jobsDetails = this.querySelector(".jobs-details");
    if (jobsDetails) {
      const descElement = jobsDetails.querySelector(
        "#job-details, .jobs-description-content__text--stretch, .jobs-box__html-content, .jobs-description__content"
      );
      if (descElement) {
        const cleanText = this.extractCleanText(descElement);
        if (cleanText && this.isValidJobDescription(cleanText)) {
          return { text: cleanText, selector: ".jobs-details > description", triedSelectors: selectors };
        }
      }
    }

    return { text: "", selector: "", triedSelectors: selectors };
  }

  /**
   * Extract text from element, removing only obvious UI elements (buttons, nav)
   * but keeping all content text including button text for fit-level-preferences
   */
  private extractTextFromElement(element: Element): string {
    // Clone to avoid modifying original
    const clone = element.cloneNode(true) as Element;

    // For fit-level-preferences, we want to keep button text
    const isFitLevel =
      element.classList.contains("job-details-fit-level-preferences") ||
      element.closest(".job-details-fit-level-preferences") !== null;

    if (isFitLevel) {
      // For fit level preferences, extract text from buttons but keep the text
      // The buttons contain the actual information we want (Hybrid, Full-time, etc.)
      return clone.textContent?.trim() || "";
    }

    // For other elements, remove only obvious UI elements but keep their text
    // Remove navigation and non-content buttons, but keep button text for content buttons
    const navElements = clone.querySelectorAll("nav, [role='navigation']");
    navElements.forEach((el) => el.remove());

    // For buttons, we want to keep the text but remove the button wrapper
    // This is handled by textContent which gets all text including button text

    return clone.textContent?.trim() || "";
  }

  /**
   * Wait for iframe to load (if it exists)
   */
  private async waitForIframe(maxWaitMs: number = 2000): Promise<void> {
    const iframe = document.querySelector("iframe.interop-iframe") as HTMLIFrameElement | null;

    if (!iframe) {
      return;
    }

    // Wait for iframe to load and be accessible
    let attempts = 0;
    const maxAttempts = Math.floor(maxWaitMs / 100);

    while (attempts < maxAttempts) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc && iframeDoc.readyState === "complete") {
          // Check if content is loaded by looking for key elements
          const hasContent = iframeDoc.querySelector(
            ".jobs-search__job-details--wrapper, .job-details-jobs-unified-top-card__container"
          );
          if (hasContent) {
            return;
          }
        }
      } catch (e) {
        // Cross-origin, cannot access
        logger.warn("[LinkedInCollectionExtractor] Cannot access iframe (cross-origin):", e);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
  }

  /**
   * Get the document from the interop-iframe if it exists
   */
  private getIframeDocument(): Document | null {
    // Try to find the interop-iframe
    const iframe = document.querySelector("iframe.interop-iframe") as HTMLIFrameElement | null;
    if (iframe) {
      try {
        // Try to access the iframe's content document
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          return iframeDoc;
        }
      } catch (e) {
        // Cross-origin iframe, cannot access
        logger.warn("[LinkedInCollectionExtractor] Cannot access iframe content (cross-origin):", e);
      }
    }
    // Fallback to main document
    return document;
  }

  /**
   * Query selector that works in both iframe and main document
   * Tries iframe first, then falls back to main document
   */
  private querySelector(selector: string): Element | null {
    // Try iframe first
    if (this.iframeDocument) {
      try {
        const element = this.iframeDocument.querySelector(selector);
        if (element) {
          return element;
        }
      } catch (e) {
        logger.warn("[LinkedInCollectionExtractor] Error querying iframe:", e);
      }
    }

    // Fallback to main document
    try {
      return document.querySelector(selector);
    } catch (e) {
      logger.warn("[LinkedInCollectionExtractor] Error querying document:", e);
      return null;
    }
  }

  private extractTitle(): string {
    // Try selectors in order of specificity
    const titleSelectors = [
      ".job-details-jobs-unified-top-card__job-title",
      ".job-card-list__title--link strong",
      ".job-card-list__title--link",
      "h1.job-details-jobs-unified-top-card__job-title",
      ".jobs-details h1",
      "h1",
    ];

    for (const selector of titleSelectors) {
      const element = this.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim();
        if (text && text.length > 0 && text !== "LinkedIn" && !text.includes("Jobs")) {
          // Remove "(Verified job)" suffix if present
          const cleaned = text.replace(/\s*\(Verified job\)\s*/i, "").trim();
          return cleaned;
        }
      }
    }

    return "Unknown Title";
  }

  private extractCompany(): string {
    // Try selectors in order of specificity
    const companySelectors = [
      ".job-details-jobs-unified-top-card__company-name",
      ".artdeco-entity-lockup__subtitle",
      "a.job-details-jobs-unified-top-card__company-name",
      ".jobs-details a[href*='/company/']",
      ".jobs-details [class*='company']",
    ];

    for (const selector of companySelectors) {
      const element = this.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim();
        // Company names are typically short (less than 100 chars) and not empty
        if (text && text.length > 0 && text.length < 100) {
          return text;
        }
      }
    }

    return "Unknown Company";
  }

  private extractDescription(): { description: string; usedSelector: string; failedSelectors: string[] } {
    const parts: string[] = [];
    const selectors: string[] = [];
    const failedSelectors: string[] = [];

    // Step 1: Extract primary description container (location, date, etc.)
    const primaryDesc = this.extractPrimaryDescription();
    logger.info(
      `[LinkedInCollectionExtractor] Primary description: ${primaryDesc.text ? `Found (${primaryDesc.text.length} chars)` : "Not found"}`
    );
    if (primaryDesc.text) {
      parts.push(primaryDesc.text);
      if (primaryDesc.selector) selectors.push(primaryDesc.selector);
    } else {
      failedSelectors.push(...primaryDesc.triedSelectors);
    }

    // Step 2: Extract fit level preferences (Hybrid, Full-time, etc.)
    const fitLevel = this.extractFitLevelPreferences();
    logger.info(`[LinkedInCollectionExtractor] Fit level: ${fitLevel.text ? `Found (${fitLevel.text})` : "Not found"}`);
    if (fitLevel.text) {
      parts.push(fitLevel.text);
      if (fitLevel.selector) selectors.push(fitLevel.selector);
    } else {
      failedSelectors.push(...fitLevel.triedSelectors);
    }

    // Step 3: Extract main job description
    const mainDescription = this.extractMainJobDescription();
    logger.info(
      `[LinkedInCollectionExtractor] Main description: ${mainDescription.text ? `Found (${mainDescription.text.length} chars)` : "Not found"}`
    );
    if (mainDescription.text) {
      parts.push(mainDescription.text);
      if (mainDescription.selector) selectors.push(mainDescription.selector);
    } else {
      failedSelectors.push(...mainDescription.triedSelectors);
    }

    const combinedDescription = parts.join("\n\n");
    const usedSelector = selectors.length > 0 ? selectors.join(" + ") : "none";

    logger.info(
      `[LinkedInCollectionExtractor] Final description length: ${combinedDescription.length} chars, selectors: ${usedSelector}`
    );

    if (combinedDescription) {
      return { description: combinedDescription, usedSelector, failedSelectors: [] };
    }

    return { description: "", usedSelector: "", failedSelectors };
  }
}
