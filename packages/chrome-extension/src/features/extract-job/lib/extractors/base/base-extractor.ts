import type { JobDescription } from "@/entities/job";

export abstract class BaseJobExtractor {
  /**
   * Whether this extractor is enabled. Disabled extractors will be skipped.
   * Defaults to true. Override in subclasses to disable.
   */
  protected enabled: boolean = true;

  abstract canExtract(url: string): boolean;
  abstract extract(): Promise<JobDescription>;

  /**
   * Check if this extractor is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  protected getCurrentUrl(): string {
    return window.location.href;
  }

  protected getCurrentHostname(): string {
    return window.location.hostname;
  }

  /**
   * Filters out elements that are likely not part of the job description
   * (navigation, buttons, comments, ads, etc.)
   */
  protected shouldExcludeElement(element: Element): boolean {
    // Exclude common UI elements
    const excludeSelectors = [
      "nav",
      "header",
      "footer",
      "aside",
      "[role='navigation']",
      "[role='banner']",
      "[role='contentinfo']",
      "[role='complementary']",
      "button",
      ".button",
      "[class*='button']",
      "[class*='nav']",
      "[class*='menu']",
      "[class*='header']",
      "[class*='footer']",
      "[class*='sidebar']",
      "[class*='comment']",
      "[class*='ad']",
      "[class*='advertisement']",
      "[id*='nav']",
      "[id*='menu']",
      "[id*='header']",
      "[id*='footer']",
      "[id*='sidebar']",
      "[id*='comment']",
      "[id*='ad']",
    ];

    // Check if element matches any exclude selector
    for (const selector of excludeSelectors) {
      if (element.matches(selector) || element.closest(selector)) {
        return true;
      }
    }

    // Exclude elements with very little text (likely UI elements)
    const text = element.textContent?.trim() || "";
    if (text.length < 20) {
      return true;
    }

    // Exclude elements that are mostly links or buttons
    const interactiveElements = element.querySelectorAll("a, button, input, select");
    const textLength = text.length;
    const interactiveTextLength = Array.from(interactiveElements)
      .map((el) => el.textContent?.trim().length || 0)
      .reduce((sum, len) => sum + len, 0);

    // If more than 50% of text is in interactive elements, likely not description
    if (textLength > 0 && interactiveTextLength / textLength > 0.5) {
      return true;
    }

    return false;
  }

  /**
   * Extracts text content from an element, excluding unwanted child elements
   */
  protected extractCleanText(element: Element | null): string {
    if (!element) return "";

    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as Element;

    // Remove excluded elements from clone
    const allElements = clone.querySelectorAll("*");
    allElements.forEach((el) => {
      if (this.shouldExcludeElement(el)) {
        el.remove();
      }
    });

    // Also check the root element itself
    if (this.shouldExcludeElement(clone)) {
      return "";
    }

    return clone.textContent?.trim() || "";
  }

  /**
   * Generates a simple selector string for an element (for debugging purposes)
   */
  protected getElementSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }
    if (element.className && typeof element.className === "string") {
      const classes = element.className.split(" ").filter((c) => c.length > 0);
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes[0]}`;
      }
    }
    return element.tagName.toLowerCase();
  }

  /**
   * Validates if the extracted description looks like a real job description
   */
  protected isValidJobDescription(description: string): boolean {
    if (!description || description.length < 100) {
      return false;
    }

    // For very long texts (likely job descriptions), be more lenient
    if (description.length > 2000) {
      // Just check for a few common words
      const lowerDescription = description.toLowerCase();
      const hasCommonWords =
        lowerDescription.includes("experience") ||
        lowerDescription.includes("experiência") ||
        lowerDescription.includes("skills") ||
        lowerDescription.includes("habilidades") ||
        lowerDescription.includes("requirements") ||
        lowerDescription.includes("requisitos") ||
        lowerDescription.includes("responsibilities") ||
        lowerDescription.includes("responsabilidades") ||
        lowerDescription.includes("qualifications") ||
        lowerDescription.includes("qualificações");
      return hasCommonWords;
    }

    // Job descriptions typically contain certain keywords (English and Portuguese)
    const jobKeywords = [
      // English
      "responsibilities",
      "requirements",
      "qualifications",
      "experience",
      "skills",
      "benefits",
      "salary",
      "location",
      "remote",
      "full-time",
      "part-time",
      "apply",
      "candidate",
      "position",
      "role",
      // Portuguese
      "responsabilidades",
      "requisitos",
      "qualificações",
      "experiência",
      "habilidades",
      "benefícios",
      "salário",
      "localização",
      "remoto",
      "tempo integral",
      "meio período",
      "candidato",
      "posição",
      "vaga",
      "cargo",
    ];

    const lowerDescription = description.toLowerCase();
    const foundKeywords = jobKeywords.filter((keyword) => lowerDescription.includes(keyword));
    const keywordCount = foundKeywords.length;

    // If it has at least 2 job-related keywords, likely a job description
    return keywordCount >= 2;
  }
}
