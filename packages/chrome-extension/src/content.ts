import { JobExtractorFactory } from "@/features/extract-job";
import { ElementPicker } from "@/features/learning/element-picker";
import { runtime } from "@/shared/chrome-api";
import { injectJobzMatchButton } from "@/widgets/job-actions";

// Inject Jobz Match button on LinkedIn pages
if (window.location.href.includes("linkedin.com/jobs/")) {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      injectJobzMatchButton();
    });
  } else {
    injectJobzMatchButton();
  }
}

let elementPicker: ElementPicker | null = null;

// Listen for messages from devtools
runtime.onMessage(async (request, _sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({ success: true });
    return;
  }

  if (request.action === "startLearning") {
    if (!elementPicker) {
      elementPicker = new ElementPicker((selector, text) => {
        runtime.sendMessage({
          action: "elementSelected",
          selector,
          text,
        });
      });
    }
    elementPicker.start();
    sendResponse({ success: true });
    return;
  }

  if (request.action === "stopLearning") {
    if (elementPicker) {
      elementPicker.stop();
    }
    sendResponse({ success: true });
    return;
  }

  if (request.action === JobExtractorFactory.ACTION) {
    let extractorName = "unknown";
    try {
      const factory = new JobExtractorFactory();
      const extractor = factory.getExtractor(window.location.href);
      extractorName = extractor.constructor.name;
      const job = await extractor.extract();
      // Always return the job, even if it's not valid (has "No description available")
      // This ensures extractionMetadata with failedSelectors is always available for debugging
      sendResponse({ success: true, job });
    } catch (error) {
      // Try to get partial job info even on error
      // Extractors should always return a job object, but if they throw, try again
      let partialJob = null;
      try {
        const factory = new JobExtractorFactory();
        const extractor = factory.getExtractor(window.location.href);
        extractorName = extractor.constructor.name;
        // Some extractors might return partial data even if they throw
        partialJob = await extractor.extract();
      } catch (innerError) {
        // If extraction fails completely, log for debugging
        console.error("[content] Extraction failed completely:", innerError);
      }
      // Always include the job if we have it, even if success is false
      // This ensures extractionMetadata with failedSelectors is available for debugging
      sendResponse({
        success: false,
        error: String(error),
        job: partialJob || undefined,
        extractorName,
      });
    }
  }
});
