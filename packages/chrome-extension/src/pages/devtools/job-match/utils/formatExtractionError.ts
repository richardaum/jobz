import type { JobDescription } from "@/entities/job";

export function formatExtractionError(
  error: string | null | undefined,
  job: JobDescription | null | undefined
): string {
  let errorMsg =
    "Failed to extract job information. The page might not contain job details or the extractor couldn't find them.";

  // If there's an explicit error (usually from an exception), show it prominently
  if (error) {
    errorMsg = `🚨 Extraction Exception:\n${error}\n\n${errorMsg}`;
  }

  if (!job?.extractionMetadata) {
    if (job?.source) {
      errorMsg += `\n\nExtractor used: ${job.source}`;
      errorMsg += `\n\n⚠️ No extraction metadata available. This may indicate the extractor failed before tracking selectors.`;
      errorMsg += `\n\n💡 Tip: Check the browser console for detailed error messages.`;
    } else {
      errorMsg += `\n\n⚠️ No job data or extraction metadata available for debugging.`;
      errorMsg += `\n\nThis usually means the extractor threw an exception before returning any data.`;
      errorMsg += `\n\n💡 Tip: Check the browser console for detailed error messages.`;
    }
    return errorMsg;
  }

  const metadata = job.extractionMetadata;
  const selectorInfo: string[] = [];

  // Always show extractor source first
  if (job.source) {
    selectorInfo.push(`Extractor: ${job.source}`);
  }

  // Show used selector if it exists (even if it's "none" or "generic-selector" for debugging)
  if (metadata.usedSelector) {
    if (metadata.usedSelector === "none" || metadata.usedSelector === "generic-selector") {
      selectorInfo.push(`Used selector: ${metadata.usedSelector} (no valid selector found)`);
    } else {
      selectorInfo.push(`Used selector: ${metadata.usedSelector}`);
    }
  } else {
    selectorInfo.push(`Used selector: (not set)`);
  }

  // Check for extraction errors in failedSelectors first
  const extractionErrors =
    metadata.failedSelectors?.filter((s) => s.includes("Extraction error:") || s.includes("error:")) || [];

  const actualFailedSelectors =
    metadata.failedSelectors?.filter((s) => !s.includes("Extraction error:") && !s.includes("error:")) || [];

  // Show extraction errors prominently if they exist
  if (extractionErrors.length > 0) {
    selectorInfo.push(`\n🚨 Extraction Errors:`);
    extractionErrors.forEach((err) => {
      // Extract just the error message part
      let errorMsg = err.replace(/^(Extraction error:|error:)\s*/i, "").trim();

      // Format stack trace if present (indent it)
      if (errorMsg.includes("\n")) {
        const lines = errorMsg.split("\n");
        const firstLine = lines[0];
        const stackTrace = lines
          .slice(1)
          .map((line) => `    ${line}`)
          .join("\n");
        errorMsg = `${firstLine}\n${stackTrace}`;
      }

      selectorInfo.push(`  ❌ ${errorMsg}`);
    });
  }

  // Show failed selectors - this is critical for manual debugging
  if (actualFailedSelectors.length > 0) {
    const failedList = actualFailedSelectors.slice(0, 20); // Show more selectors for debugging
    selectorInfo.push(
      `\nFailed selectors (${actualFailedSelectors.length}):\n${failedList.map((s) => `  - ${s}`).join("\n")}${
        actualFailedSelectors.length > 20 ? `\n  ... and ${actualFailedSelectors.length - 20} more` : ""
      }`
    );
  } else if (extractionErrors.length === 0) {
    // If no failed selectors are tracked, provide context based on extractor type
    if (job.source === "generic") {
      selectorInfo.push(
        `\n⚠️ No failed selectors tracked. Generic extractor tried common selectors but found no valid job description.`
      );
    } else if (job.source === "dynamic") {
      selectorInfo.push(
        `\n⚠️ No failed selectors tracked. Dynamic extractor tried configured selectors but found no valid job description.`
      );
    } else if (job.source === "linkedin") {
      selectorInfo.push(
        `\n⚠️ No failed selectors tracked. LinkedIn extractor tried standard selectors but found no valid job description.`
      );
    } else {
      selectorInfo.push(`\n⚠️ No failed selectors tracked. The extractor may not have attempted any selectors.`);
    }
  }

  if (selectorInfo.length > 0) {
    errorMsg += `\n\n${selectorInfo.join("\n")}`;
  }

  return errorMsg;
}
