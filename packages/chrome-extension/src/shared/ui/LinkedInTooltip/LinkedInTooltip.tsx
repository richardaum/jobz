import * as Tooltip from "@radix-ui/react-tooltip";
import React, { useMemo } from "react";

interface LinkedInTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showArrow?: boolean;
}

export function LinkedInTooltip({
  children,
  content,
  side = "top",
  sideOffset = 8,
  open,
  onOpenChange,
  showArrow = true,
}: LinkedInTooltipProps) {
  // Get the correct document body for portal rendering
  // This ensures we render into the page's document, not an extension context
  // Using useMemo to avoid recreating the reference on every render
  const portalContainer = useMemo(() => {
    try {
      // Try to get the document where the component is mounted
      // This handles both main document and iframe contexts
      if (typeof document !== "undefined" && document.body) {
        return document.body;
      }
    } catch (e) {
      // Fallback if document is not accessible
    }
    return undefined; // Let Radix use default behavior
  }, []);

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root open={open} onOpenChange={onOpenChange} disableHoverableContent>
        <Tooltip.Trigger asChild data-jobz-tooltip-trigger="true">
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal container={portalContainer}>
          <Tooltip.Content
            data-jobz-tooltip="true"
            side={side}
            sideOffset={sideOffset}
            style={{
              backgroundColor: "#fff",
              color: "rgba(0, 0, 0, 0.9)",
              padding: "12px 16px",
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.08)",
              fontSize: "14px",
              lineHeight: "1.42857",
              maxWidth: "350px",
              zIndex: 999999,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              pointerEvents: "auto",
            }}
          >
            {content}
            {showArrow && (
              <Tooltip.Arrow
                style={{
                  fill: "#fff",
                  filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                }}
              />
            )}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
