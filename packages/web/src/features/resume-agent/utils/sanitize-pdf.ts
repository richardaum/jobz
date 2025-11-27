/**
 * Sanitizes text content for PDF generation
 * - Removes or replaces problematic characters
 * - Normalizes whitespace
 * - Handles special characters
 */
export function sanitizeForPDF(content: string): string {
  return (
    content
      // FIRST: Replace all bullet point variations with simple dash to prevent encoding issues
      // This must happen early to prevent %Ï corruption
      .replace(/[•\u2022\u25E6\u2043\u2219\u2023\u2043\u25AA\u25AB]/g, "- ")
      // Replace non-breaking spaces and other special spaces with regular spaces
      .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ")
      // Replace smart quotes with regular quotes
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      // Replace em dashes and en dashes with regular dashes
      .replace(/[\u2013\u2014]/g, "-")
      // Replace ellipsis with three dots
      .replace(/\u2026/g, "...")
      // Remove zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      // Normalize line breaks
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Fix words that were incorrectly split across lines
      // Look for patterns like "word1\nword2" where they should be together
      .replace(/([a-zA-Z]{1,3})\n([a-zA-Z]{2,})/g, (match, p1, p2) => {
        // If the first part is very short and second starts with lowercase, likely a broken word
        if (p1.length <= 3 && /^[a-z]/.test(p2)) {
          return `${p1}${p2}`;
        }
        return match;
      })
      // Remove trailing whitespace from each line
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      // Remove excessive blank lines (more than 2 consecutive)
      .replace(/\n{3,}/g, "\n\n")
      // Trim overall content
      .trim()
  );
}


