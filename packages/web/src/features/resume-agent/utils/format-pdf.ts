/**
 * Formats text content for better PDF presentation
 * - Normalizes section headers
 * - Improves spacing
 * - Handles bullet points (replaces with simple dash for better PDF compatibility)
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
      // Normalize spacing around dashes used as separators (but preserve bullet dashes)
      // Only fix dashes that are between words, not at the start of lines (bullets)
      .replace(/([^\s-])\s*-\s*([^\s-])/g, "$1 - $2")
      // Remove excessive spaces (but preserve single spaces)
      .replace(/[ \t]{2,}/g, " ")
      // Clean up multiple blank lines
      .replace(/\n{3,}/g, "\n\n")
  );
}

