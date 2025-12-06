import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "@/shared/lib";

interface TooltipProps extends Omit<React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>, "children"> {
  children: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  delayDuration?: number;
  sideOffset?: number;
}

const Tooltip = ({
  disabled,
  children,
  content,
  side = "top",
  className,
  delayDuration = 100,
  sideOffset = 4,
  ...props
}: TooltipProps) => {
  if (disabled) {
    // When disabled, render children without tooltip wrapper
    return <>{children}</>;
  }

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root {...props}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={sideOffset}
          className={cn(
            "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
Tooltip.displayName = TooltipPrimitive.Root.displayName;

export { Tooltip };
