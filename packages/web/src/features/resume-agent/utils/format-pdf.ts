/**
 * Formats text content for better PDF presentation
 * Simplified version since the AI prompt now handles character simplification
 * - Normalizes section headers
 * - Improves spacing
 */
export function formatForPDF(content: string): string {
  return (
    content
      // Ensure consistent spacing around headers (lines in ALL CAPS or Title Case)
      .replace(/^([A-Z][A-Z\s&]+)$/gm, (match) => {
        // If it's a header (all caps or title case), add spacing
        if (match.length > 0 && match.length < 50) {
          return `\n${match}\n`;
        }
        return match;
      })
      // Normalize spacing around colons
      .replace(/:\s*/g, ": ")
      // Remove excessive spaces (but preserve single spaces)
      .replace(/[ \t]{2,}/g, " ")
      // Clean up multiple blank lines
      .replace(/\n{3,}/g, "\n\n")
  );
}
