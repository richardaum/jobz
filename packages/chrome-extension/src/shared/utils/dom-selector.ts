/**
 * Generates a unique CSS selector for a given DOM element.
 * Tries to use ID, then classes, then structural path.
 */
export function getUniqueSelector(element: Element): string {
  if (!(element instanceof Element)) return "";

  // 1. Try ID
  if (element.id) {
    // Check if ID is unique
    if (document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1) {
      return `#${CSS.escape(element.id)}`;
    }
  }

  // 2. Try data attributes (common in modern frameworks)
  const dataAttributes = ["data-testid", "data-test-id", "data-qa", "data-cy"];
  for (const attr of dataAttributes) {
    if (element.hasAttribute(attr)) {
      const value = element.getAttribute(attr);
      if (value) {
        const selector = `[${attr}="${CSS.escape(value)}"]`;
        if (document.querySelectorAll(selector).length === 1) {
          return selector;
        }
      }
    }
  }

  // 3. Try unique class combination
  if (element.className && typeof element.className === "string") {
    const classes = element.className.split(/\s+/).filter((c) => c.trim().length > 0);
    if (classes.length > 0) {
      const classSelector = "." + classes.map((c) => CSS.escape(c)).join(".");
      if (document.querySelectorAll(classSelector).length === 1) {
        return classSelector;
      }
    }
  }

  // 4. Fallback to structural path
  const path: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body && current !== document.documentElement) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${CSS.escape(current.id)}`;
      path.unshift(selector);
      break; // ID is usually unique enough to stop traversing up
    } else {
      let sibling = current;
      let nth = 1;
      while (sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling;
        if (sibling.tagName === current.tagName) {
          nth++;
        }
      }
      if (nth > 1) {
        selector += `:nth-of-type(${nth})`;
      }
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(" > ");
}
