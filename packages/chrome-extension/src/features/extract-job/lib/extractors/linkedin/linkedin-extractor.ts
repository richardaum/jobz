import type { JobDescription } from "@/entities/job";

import { BaseJobExtractor } from "../base/base-extractor";

export class LinkedInExtractor extends BaseJobExtractor {
  protected enabled: boolean = false; // Disabled - only DynamicExtractor is enabled

  canExtract(url: string): boolean {
    return url.includes("linkedin.com/jobs/view/");
  }

  async extract(): Promise<JobDescription> {
    let title = "Unknown Title";
    let company = "Unknown Company";
    let description = "No description available";
    let usedSelector = "none";
    let failedSelectors: string[] = [];

    try {
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
        isCollection: false,
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

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = this.extractTextFromElement(element);
        if (text && text.length >= 5) {
          return { text, selector, triedSelectors: selectors };
        }
      }
    }

    return { text: "", selector: "", triedSelectors: selectors };
  }

  /**
   * Extract fit level preferences (Hybrid, Full-time, Remote, etc.)
   */
  private extractFitLevelPreferences(): { text: string; selector: string; triedSelectors: string[] } {
    const selectors = [".job-details-fit-level-preferences", "[class*='fit-level-preferences']"];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = this.extractTextFromElement(element);
        if (text && text.length >= 3) {
          return { text, selector, triedSelectors: selectors };
        }
      }
    }

    return { text: "", selector: "", triedSelectors: selectors };
  }

  /**
   * Extract main job description content
   */
  private extractMainJobDescription(): { text: string; selector: string; triedSelectors: string[] } {
    const selectors = [
      "#job-details",
      ".jobs-description-content__text--stretch",
      ".jobs-box__html-content",
      ".jobs-description-content__text",
      ".jobs-description__text",
      ".jobs-description__content",
      ".jobs-description__container",
      "[data-test-id='job-details']",
      ".jobs-description",
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const cleanText = this.extractCleanText(element);
        if (cleanText && this.isValidJobDescription(cleanText)) {
          return { text: cleanText, selector, triedSelectors: selectors };
        }
      }
    }

    // Fallback: try to find within main content
    const mainContent = document.querySelector("main .jobs-details__main-content, main .jobs-description");
    if (mainContent) {
      const descElement = mainContent.querySelector(
        "#job-details, .jobs-description-content__text--stretch, .jobs-box__html-content, .jobs-description__content"
      );
      if (descElement) {
        const cleanText = this.extractCleanText(descElement);
        if (cleanText && this.isValidJobDescription(cleanText)) {
          return { text: cleanText, selector: "main > description", triedSelectors: selectors };
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

  private extractTitle(): string {
    const titleElement = document.querySelector("h1.job-details-jobs-unified-top-card__job-title");
    return titleElement?.textContent?.trim() || "Unknown Title";
  }

  private extractCompany(): string {
    const companyElement = document.querySelector("a.job-details-jobs-unified-top-card__company-name");
    return companyElement?.textContent?.trim() || "Unknown Company";
  }

  private extractDescription(): { description: string; usedSelector: string; failedSelectors: string[] } {
    const parts: string[] = [];
    const selectors: string[] = [];
    const failedSelectors: string[] = [];
    const allTriedSelectors: string[] = []; // Track all selectors tried for debugging

    // Step 1: Extract primary description container (location, date, etc.)
    const primaryDesc = this.extractPrimaryDescription();
    allTriedSelectors.push(...primaryDesc.triedSelectors);
    if (primaryDesc.text) {
      parts.push(primaryDesc.text);
      if (primaryDesc.selector) selectors.push(primaryDesc.selector);
    } else {
      failedSelectors.push(...primaryDesc.triedSelectors);
    }

    // Step 2: Extract fit level preferences (Hybrid, Full-time, etc.)
    const fitLevel = this.extractFitLevelPreferences();
    allTriedSelectors.push(...fitLevel.triedSelectors);
    if (fitLevel.text) {
      parts.push(fitLevel.text);
      if (fitLevel.selector) selectors.push(fitLevel.selector);
    } else {
      failedSelectors.push(...fitLevel.triedSelectors);
    }

    // Step 3: Extract main job description
    const mainDescription = this.extractMainJobDescription();
    allTriedSelectors.push(...mainDescription.triedSelectors);
    if (mainDescription.text) {
      parts.push(mainDescription.text);
      if (mainDescription.selector) selectors.push(mainDescription.selector);
    } else {
      failedSelectors.push(...mainDescription.triedSelectors);
    }

    const combinedDescription = parts.join("\n\n");
    const usedSelector = selectors.length > 0 ? selectors.join(" + ") : "none";

    // Validate the combined description
    const isValid = combinedDescription && this.isValidJobDescription(combinedDescription);

    if (isValid) {
      // If valid, we still include failed selectors for debugging context
      return { description: combinedDescription, usedSelector, failedSelectors };
    }

    // If not valid or empty, include all tried selectors in failedSelectors for debugging
    // This ensures we always have selector information for manual debugging
    const allFailed = failedSelectors.length > 0 
      ? [...new Set([...failedSelectors, ...allTriedSelectors])] // Remove duplicates
      : allTriedSelectors;

    return { description: combinedDescription || "", usedSelector: usedSelector || "none", failedSelectors: allFailed };
  }
}
