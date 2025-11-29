import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker for Next.js
// Initialize worker only once when needed
let workerInitialized = false;

function ensureWorkerInitialized() {
  if (typeof window === "undefined") {
    return;
  }

  if (workerInitialized) {
    return;
  }

  try {
    // Use unpkg CDN with the correct version and file extension
    // For pdfjs-dist 4.x, use .mjs extension
    const version = pdfjsLib.version || "4.10.38";
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    workerInitialized = true;
  } catch (error) {
    console.warn("Failed to initialize PDF.js worker with .mjs, trying .js:", error);
    // Fallback to .js extension
    try {
      const version = pdfjsLib.version || "4.10.38";
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`;
      workerInitialized = true;
    } catch (jsError) {
      console.error("Failed to initialize PDF.js worker:", jsError);
      // Last resort: disable worker (legacy mode - slower but works)
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "";
        workerInitialized = true;
      } catch (fallbackError) {
        console.error("Failed to set fallback worker:", fallbackError);
      }
    }
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  // Ensure worker is initialized before use
  ensureWorkerInitialized();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n\n";
  }

  return fullText.trim();
}
