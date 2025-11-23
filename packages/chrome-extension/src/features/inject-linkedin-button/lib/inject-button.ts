import React from "react";
import { createRoot } from "react-dom/client";

import { JobzMatchButton } from "../ui/JobzMatchButton";
import { TestTooltipButton } from "../ui/TestTooltipButton";

// Global flag to prevent multiple injection attempts
let isInjecting = false;
let observer: MutationObserver | null = null;

export function injectJobzMatchButton() {
  // Detect if we're inside an iframe
  const isInIframe = window.self !== window.top;

  // Get the correct document to work with
  const getTargetDocument = (): Document => {
    // If we're in an iframe, use current document
    if (isInIframe) {
      return document;
    }

    // If we're in main document, check for iframe
    try {
      const iframe = document.querySelector("iframe.interop-iframe") as HTMLIFrameElement | null;
      if (iframe) {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            return iframeDoc;
          }
        } catch (e) {
          // Cross-origin iframe, cannot access
        }
      }
    } catch (e) {
      // Ignore errors
    }

    // Fallback to current document
    return document;
  };

  // Wait for page to be fully loaded
  const waitForPageLoad = (doc: Document, callback: () => void) => {
    const readyState = doc.readyState;

    // If already complete, wait a bit more for dynamic content
    if (readyState === "complete" || (readyState === "interactive" && window.performance?.timing?.loadEventEnd > 0)) {
      setTimeout(callback, 500);
      return;
    }

    // Wait for both DOMContentLoaded and load events
    let domReady = readyState !== "loading";
    let windowLoaded = false;

    const checkAndRun = () => {
      if (domReady && windowLoaded) {
        setTimeout(callback, 500);
      }
    };

    if (!domReady) {
      doc.addEventListener(
        "DOMContentLoaded",
        () => {
          domReady = true;
          checkAndRun();
        },
        { once: true }
      );
    }

    const win = doc.defaultView || window;
    win.addEventListener(
      "load",
      () => {
        windowLoaded = true;
        checkAndRun();
      },
      { once: true }
    );
  };

  const injectIntoDocument = (doc: Document) => {
    // Prevent multiple simultaneous injection attempts
    if (isInjecting) {
      return;
    }

    const injectButton = (container: Element, referenceButton: Element, doc: Document) => {
      // Check if already injected in this container
      if (container.querySelector("[data-jobz-match-button]")) {
        return;
      }

      // Create container for our button
      const jobzButtonContainer = doc.createElement("span");
      jobzButtonContainer.setAttribute("data-jobz-match-button", "true");
      jobzButtonContainer.style.marginLeft = "8px";
      jobzButtonContainer.style.display = "inline-flex";
      jobzButtonContainer.style.alignItems = "center";

      // Create root and render
      const root = createRoot(jobzButtonContainer);
      root.render(React.createElement(JobzMatchButton));

      // Insert after Save button
      if (referenceButton.nextSibling) {
        container.insertBefore(jobzButtonContainer, referenceButton.nextSibling);
      } else {
        container.appendChild(jobzButtonContainer);
      }
    };

    const injectTestButton = (container: Element, doc: Document) => {
      // Check if already injected in this container first (most important check)
      if (
        container.querySelector("[data-test-tooltip-container]") ||
        container.querySelector("[data-test-tooltip-button]")
      ) {
        return;
      }

      // Also check in the document to be safe
      if (doc.querySelector("[data-test-tooltip-button]")) {
        return;
      }

      // Create container for test button
      const testButtonContainer = doc.createElement("span");
      testButtonContainer.setAttribute("data-test-tooltip-container", "true");
      testButtonContainer.style.marginLeft = "8px";
      testButtonContainer.style.display = "inline-flex";
      testButtonContainer.style.alignItems = "center";

      // Create root and render
      const root = createRoot(testButtonContainer);
      root.render(React.createElement(TestTooltipButton));

      // Insert at the end of container
      container.appendChild(testButtonContainer);
    };

    const checkAndInject = () => {
      // Check if buttons already exist and are still in the DOM
      const existingButton = doc.querySelector("[data-jobz-match-button]");
      const existingTestButton = doc.querySelector("[data-test-tooltip-container]");
      if (
        existingButton &&
        doc.body.contains(existingButton) &&
        existingTestButton &&
        doc.body.contains(existingTestButton)
      ) {
        return;
      }

      // If button was removed, it will be re-injected below
      isInjecting = true;

      // Look for the container that holds both Apply and Save buttons
      // Based on the HTML structure provided, it's in .display-flex.mt4
      const buttonContainer = doc.querySelector(
        ".display-flex.mt4, .jobs-s-apply, [class*='jobs-apply-button']"
      )?.parentElement;

      if (!buttonContainer) {
        // Try alternative selectors
        const altContainer = doc.querySelector(".job-details-jobs-unified-top-card__container--two-pane .mt4");
        if (altContainer) {
          const saveButton = altContainer.querySelector(".jobs-save-button, [class*='jobs-save-button']");
          if (saveButton && saveButton.parentElement) {
            injectButton(saveButton.parentElement, saveButton, doc);
            isInjecting = false;
            return;
          }
        }
        isInjecting = false;
        return;
      }

      // Find the Save button within the container
      const saveButton = buttonContainer.querySelector(
        ".jobs-save-button, [class*='jobs-save-button'], button[aria-label*='Save']"
      );

      if (saveButton) {
        injectButton(buttonContainer, saveButton, doc);
        // Also inject test button (only if main button was successfully injected)
        if (buttonContainer.querySelector("[data-jobz-match-button]")) {
          injectTestButton(buttonContainer, doc);
        }
      }

      isInjecting = false;
    };

    // Try immediately
    checkAndInject();
  };

  // Get target document and inject
  const targetDoc = getTargetDocument();

  // Wait for page to be fully loaded before injecting
  waitForPageLoad(targetDoc, () => {
    injectIntoDocument(targetDoc);
  });

  // Watch for changes in the specific container area, not the entire body
  // This prevents re-injection when unrelated DOM changes occur
  const setupObserver = (doc: Document) => {
    if (observer) {
      observer.disconnect();
    }

    // Find the container to observe
    const containerToObserve =
      doc.querySelector(".job-details-jobs-unified-top-card__container--two-pane") ||
      doc.querySelector(".jobs-search__job-details--container") ||
      doc.body;

    if (!containerToObserve) {
      return;
    }

    observer = new MutationObserver((mutations) => {
      // Only react if the Save button or its container was affected
      const shouldRecheck = mutations.some((mutation) => {
        const target = mutation.target as Element;
        return (
          target.querySelector?.(".jobs-save-button, [class*='jobs-save-button']") ||
          target.classList?.contains("jobs-save-button") ||
          target.closest?.(".display-flex.mt4, .jobs-s-apply")
        );
      });

      if (shouldRecheck) {
        // Debounce to avoid too many checks
        setTimeout(() => {
          const existingButton = doc.querySelector("[data-jobz-match-button]");
          const existingTestButton = doc.querySelector("[data-test-tooltip-container]");
          if (
            !existingButton ||
            !doc.body.contains(existingButton) ||
            !existingTestButton ||
            !doc.body.contains(existingTestButton)
          ) {
            injectIntoDocument(doc);
          }
        }, 100);
      }
    });

    observer.observe(containerToObserve, {
      childList: true,
      subtree: true,
    });
  };

  // Setup observer after a short delay to ensure DOM is ready
  setTimeout(() => setupObserver(targetDoc), 500);

  // Also check periodically but less frequently
  let attempts = 0;
  const maxAttempts = 10;
  const interval = setInterval(() => {
    attempts++;
    const existingButton = targetDoc.querySelector("[data-jobz-match-button]");
    const existingTestButton = targetDoc.querySelector("[data-test-tooltip-container]");
    if (
      existingButton &&
      targetDoc.body.contains(existingButton) &&
      existingTestButton &&
      targetDoc.body.contains(existingTestButton)
    ) {
      clearInterval(interval);
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
    } else {
      injectIntoDocument(targetDoc);
    }
  }, 2000);
}
