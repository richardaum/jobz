import { useCallback, useEffect, useRef } from "react";

// Threshold in pixels - if user is within this distance from bottom, auto-scroll
const SCROLL_THRESHOLD = 100;
const SCROLL_DEBOUNCE_MS = 150;
const CONTAINER_CHECK_INTERVAL_MS = 100;
const SCROLL_DELAY_MS = 100;

interface UseAutoScrollOptions {
  /**
   * Ref to the element that marks the end of the scrollable content
   */
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Whether to enable auto-scrolling
   */
  enabled?: boolean;
  /**
   * Callback to execute when scrolling to bottom
   */
  onScrollToBottom?: () => void;
  /**
   * Dependencies that should trigger auto-scroll when they change
   */
  dependencies?: unknown[];
}

/**
 * Hook to manage auto-scrolling behavior that respects user scroll position.
 * Only auto-scrolls when the user is near the bottom of the container.
 *
 * @param options - Configuration options for auto-scroll behavior
 */
export function useAutoScroll({
  messagesEndRef,
  enabled = true,
  onScrollToBottom,
  dependencies = [],
}: UseAutoScrollOptions) {
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to find and store scroll container
  const findScrollContainer = useCallback((): HTMLElement | null => {
    if (!scrollContainerRef.current && messagesEndRef.current) {
      const container = messagesEndRef.current.closest(".ms-container") as HTMLElement;
      if (container) {
        scrollContainerRef.current = container;
      }
    }
    return scrollContainerRef.current;
  }, [messagesEndRef]);

  // Handle scroll events to detect user scrolling (set up once, but container may appear later)
  useEffect(() => {
    if (!enabled) return;

    let cleanupScrollListener: (() => void) | null = null;

    // Try to find container initially
    findScrollContainer();

    const handleScroll = () => {
      isUserScrollingRef.current = true;

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Reset flag after user stops scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, SCROLL_DEBOUNCE_MS);
    };

    const setupScrollListener = (container: HTMLElement) => {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    };

    // Set up interval to check for container if it doesn't exist yet
    const intervalId = setInterval(() => {
      const container = findScrollContainer();
      if (container && !cleanupScrollListener) {
        clearInterval(intervalId);
        cleanupScrollListener = setupScrollListener(container);
      }
    }, CONTAINER_CHECK_INTERVAL_MS);

    // Also try to set up immediately if container exists
    const container = scrollContainerRef.current;
    if (container && !cleanupScrollListener) {
      clearInterval(intervalId);
      cleanupScrollListener = setupScrollListener(container);
    }

    return () => {
      clearInterval(intervalId);
      if (cleanupScrollListener) {
        cleanupScrollListener();
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [enabled, findScrollContainer]);

  // Auto-scroll only if user is near bottom
  useEffect(() => {
    if (!enabled) return;

    // Don't auto-scroll if user is actively scrolling
    if (isUserScrollingRef.current) {
      return;
    }

    // Check if user is near the bottom of the scroll container
    const container = findScrollContainer();
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      // Only auto-scroll if user is near the bottom (within threshold)
      if (distanceFromBottom > SCROLL_THRESHOLD) {
        return;
      }
    }

    if (onScrollToBottom) {
      // Small delay to ensure MacScrollbar is rendered
      setTimeout(() => {
        if (messagesEndRef.current) {
          // Try scrollIntoView first
          if (typeof messagesEndRef.current.scrollIntoView === "function") {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
          // Also try scrolling the parent container (MacScrollbar)
          const scrollContainer = messagesEndRef.current?.closest(".ms-container");
          if (scrollContainer && typeof scrollContainer.scrollTo === "function") {
            scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: "smooth" });
          }
        }
        onScrollToBottom();
      }, SCROLL_DELAY_MS);
    }
  }, [enabled, messagesEndRef, onScrollToBottom, findScrollContainer, ...dependencies]);
}
