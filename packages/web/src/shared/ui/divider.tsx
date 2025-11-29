import * as React from "react";

import { cn } from "@/shared/lib";

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("bg-border", orientation === "vertical" ? "w-px h-4" : "h-px w-full", className)}
        {...props}
      />
    );
  }
);
Divider.displayName = "Divider";

export { Divider };
