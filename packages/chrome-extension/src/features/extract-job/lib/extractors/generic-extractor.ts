import type { JobDescription } from "@/entities/job";

import { BaseJobExtractor } from "./base-extractor";

export class GenericExtractor extends BaseJobExtractor {
  canExtract(_url: string): boolean {
    // Generic extractor can work on any page as fallback
    return true;
  }

  async extract(): Promise<JobDescription> {
    // Try to extract from common job posting patterns
    const titleElement =
      document.querySelector("h1") ||
      document.querySelector("[data-testid='job-title']") ||
      document.querySelector(".job-title") ||
      document.querySelector("[class*='job-title']") ||
      document.querySelector("[id*='job-title']");

    const title = titleElement?.textContent?.trim() || "Unknown Title";

    const companyElement =
      document.querySelector("[data-testid='company-name']") ||
      document.querySelector(".company-name") ||
      document.querySelector("[class*='company-name']") ||
      document.querySelector("[id*='company-name']") ||
      document.querySelector("h2");

    const company = companyElement?.textContent?.trim() || "Unknown Company";

    // Try to extract description from main content with specific selectors first
    const descriptionSelectors = [
      "[data-testid='job-description']",
      "[id='job-description']",
      "[class*='job-description']",
      "[id*='job-description']",
      ".description[class*='job']",
      "main article",
      "main [role='article']",
      "main .content",
      "#job-description",
    ];

    let description = "";
    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const cleanText = this.extractCleanText(element);
        if (cleanText && this.isValidJobDescription(cleanText)) {
          description = cleanText;
          break;
        }
      }
    }

    // Fallback: look for the largest valid text block in main
    if (!description) {
      const main = document.querySelector("main");
      if (main) {
        // Find all potential description containers
        const candidates = main.querySelectorAll("div, section, article, [role='article']");
        let bestCandidate: { element: Element; text: string; length: number } | null = null;

        for (const candidate of Array.from(candidates)) {
          if (this.shouldExcludeElement(candidate)) continue;

          const cleanText = this.extractCleanText(candidate);
          if (cleanText && this.isValidJobDescription(cleanText)) {
            if (!bestCandidate || cleanText.length > bestCandidate.length) {
              bestCandidate = { element: candidate, text: cleanText, length: cleanText.length };
            }
          }
        }

        if (bestCandidate) {
          description = bestCandidate.text;
        } else {
          // Last resort: try main itself, but be very careful
          const cleanText = this.extractCleanText(main);
          if (cleanText && this.isValidJobDescription(cleanText)) {
            description = cleanText;
          }
        }
      }
    }

    return {
      title,
      company,
      description: description || "No description available",
      source: "generic",
      url: this.getCurrentUrl(),
      extractedAt: new Date().toISOString(),
      extractionMetadata: {
        usedSelector: description ? "generic-selector" : "none",
        isCollection: false,
        failedSelectors: description ? [] : descriptionSelectors,
      },
    };
  }
}
