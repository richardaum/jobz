import { JobExtractorFactory } from "@/features/extract-job";
import { injectJobzMatchButton } from "@/features/inject-linkedin-button";

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

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({ success: true });
    return false;
  }

  if (request.action === "extractJob") {
    (async () => {
      try {
        const factory = new JobExtractorFactory();
        const extractor = factory.getExtractor(window.location.href);
        const job = await extractor.extract();
        sendResponse({ success: true, job });
      } catch (error) {
        sendResponse({ success: false, error: String(error) });
      }
    })();
    return true; // Keep channel open for async response
  }

  return false;
});
