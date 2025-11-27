import type { JobDescription } from "@/entities/job";

import { BaseJobExtractor } from "../base/base-extractor";

export class GenericExtractor extends BaseJobExtractor {
  protected enabled: boolean = false; // Disabled - only DynamicExtractor is enabled

  canExtract(_url: string): boolean {
    // Generic extractor can work on any page as fallback
    return true;
  }

  async extract(): Promise<JobDescription> {
    let title = "Unknown Title";
    let company = "Unknown Company";
    let description = "No description available";
    let usedSelector = "none";
    const failedSelectors: string[] = [];

    try {
      // Try to extract from common job posting patterns
      const titleSelectors = [
        "h1",
        "[data-testid='job-title']",
        ".job-title",
        "[class*='job-title']",
        "[id*='job-title']",
      ];

      for (const selector of titleSelectors) {
        try {
          const element = document.querySelector(selector);
          if (element?.textContent?.trim()) {
            title = element.textContent.trim();
            break;
          }
        } catch {
          // Continue to next selector
        }
      }

      const companySelectors = [
        "[data-testid='company-name']",
        ".company-name",
        "[class*='company-name']",
        "[id*='company-name']",
        "h2",
      ];

      for (const selector of companySelectors) {
        try {
          const element = document.querySelector(selector);
          if (element?.textContent?.trim()) {
            company = element.textContent.trim();
            break;
          }
        } catch {
          // Continue to next selector
        }
      }

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

      for (const selector of descriptionSelectors) {
        try {
          const element = document.querySelector(selector);
          if (element) {
            const cleanText = this.extractCleanText(element);
            if (cleanText && this.isValidJobDescription(cleanText)) {
              description = cleanText;
              usedSelector = selector;
              break;
            } else {
              failedSelectors.push(selector);
            }
          } else {
            failedSelectors.push(selector);
          }
        } catch (error) {
          failedSelectors.push(`${selector} (error: ${error})`);
        }
      }

      // Fallback: look for the largest valid text block in main
      if (!description || description === "No description available") {
        try {
          const main = document.querySelector("main");
          if (main) {
            // Find all potential description containers
            const candidates = main.querySelectorAll("div, section, article, [role='article']");
            let bestCandidate: { element: Element; text: string; length: number; selector: string } | null = null;

            for (const candidate of Array.from(candidates)) {
              try {
                if (this.shouldExcludeElement(candidate)) continue;

                const cleanText = this.extractCleanText(candidate);
                if (cleanText && this.isValidJobDescription(cleanText)) {
                  const candidateSelector = this.getElementSelector(candidate);
                  if (!bestCandidate || cleanText.length > bestCandidate.length) {
                    bestCandidate = {
                      element: candidate,
                      text: cleanText,
                      length: cleanText.length,
                      selector: candidateSelector,
                    };
                  }
                }
              } catch {
                // Continue to next candidate
              }
            }

            if (bestCandidate) {
              description = bestCandidate.text;
              usedSelector = bestCandidate.selector || "main > candidate";
            } else {
              // Last resort: try main itself, but be very careful
              try {
                const cleanText = this.extractCleanText(main);
                if (cleanText && this.isValidJobDescription(cleanText)) {
                  description = cleanText;
                  usedSelector = "main";
                } else {
                  failedSelectors.push("main");
                }
              } catch {
                failedSelectors.push("main (error)");
              }
            }
          }
        } catch (error) {
          failedSelectors.push(`main fallback (error: ${error})`);
        }
      }

      // If we didn't find a valid description, ensure all selectors tried are in failedSelectors
      if (!description || description === "No description available") {
        // Add any selectors we tried but aren't already in failedSelectors
        const allTried = [...descriptionSelectors, "main"];
        for (const selector of allTried) {
          if (!failedSelectors.includes(selector)) {
            failedSelectors.push(selector);
          }
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
      source: "generic",
      url: this.getCurrentUrl(),
      extractedAt: new Date().toISOString(),
      extractionMetadata: {
        usedSelector,
        isCollection: false,
        failedSelectors,
      },
    };
  }
}
