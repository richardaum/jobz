/**
 * Sanitizes text content for PDF generation
 * Simplified version since the AI prompt now instructs to use only simple ASCII characters
 * - Normalizes whitespace
 * - Handles edge cases for any remaining special characters
 */
export function sanitizeForPDF(content: string): string {
  return (
    content
      // Replace any remaining special spaces with regular spaces
      .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ")
      // Replace any remaining smart quotes with regular quotes (safety check)
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      // Replace any remaining em/en dashes with regular dashes (safety check)
      .replace(/[\u2013\u2014]/g, "-")
      // Replace any remaining ellipsis with three dots (safety check)
      .replace(/\u2026/g, "...")
      // Remove zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      // Normalize line breaks
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
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
