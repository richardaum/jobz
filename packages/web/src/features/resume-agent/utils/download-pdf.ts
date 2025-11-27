import { jsPDF } from "jspdf";

export function downloadResumeAsPDF(content: string, filename: string = "resume-adapted.pdf") {
  if (!content.trim()) {
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  const lineHeight = 7;
  let yPosition = margin;

  // Split content into lines, handling both \n and \r\n
  const lines = content.split(/\r?\n/);

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

    // Split long lines that exceed page width
    const splitLines = doc.splitTextToSize(line, maxWidth);

    splitLines.forEach((splitLine: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      doc.text(splitLine, margin, yPosition, { maxWidth });
      yPosition += lineHeight;
    });
  });

  doc.save(filename);
}

