import { jsPDF } from "jspdf";

import { formatForPDF } from "./format-pdf";
import { sanitizeForPDF } from "./sanitize-pdf";

export function downloadResumeAsPDF(content: string, filename: string = "adapted-resume.pdf") {
  if (!content.trim()) {
    return;
  }

  // Sanitize and format content before generating PDF
  const sanitizedContent = sanitizeForPDF(content);
  const formattedContent = formatForPDF(sanitizedContent);

  const doc = new jsPDF();
  // Set smaller font size
  doc.setFontSize(9);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  const lineHeight = 5; // Reduced line height to match smaller font
  let yPosition = margin;

  // Split content into lines, handling both \n and \r\n
  const lines = formattedContent.split(/\r?\n/);

  lines.forEach((line) => {
    // Handle empty lines
    if (line.trim() === "") {
      yPosition += lineHeight;
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      return;
    }

    // Final safety check - ensure bullets are replaced (should already be done, but double-check)
    // This prevents %Ï encoding corruption
    const safeLine = line.replace(/[•\u2022\u25E6\u2043\u2219\u2023\u2043\u25AA\u25AB]/g, "- ");

    // Split long lines that exceed page width
    // Use options to ensure proper text handling
    const splitLines = doc.splitTextToSize(safeLine, maxWidth, {
      align: "left",
    });

    splitLines.forEach((splitLine: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      // Use text method with proper encoding
      doc.text(splitLine, margin, yPosition, {
        maxWidth,
        align: "left",
      });
      yPosition += lineHeight;
    });
  });

  // Save PDF directly
  doc.save(filename);
}
