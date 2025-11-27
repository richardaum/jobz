import * as React from "react";

import { cn } from "@/shared/lib";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: "sm" | "md" | "lg";
  autoRows?: "min" | "max" | "auto";
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = "md", autoRows, ...props }, ref) => {
    const colsClass = {
      1: "grid-cols-1",
      2: "grid-cols-1 lg:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
      12: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-12",
    };

    const gapClass = {
      sm: "gap-2 sm:gap-3",
      md: "gap-4 lg:gap-6",
      lg: "gap-6 lg:gap-8",
    };

    const autoRowsClass = {
      min: "auto-rows-min",
      max: "auto-rows-max",
      auto: "auto-rows-auto",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          colsClass[cols],
          gapClass[gap],
          autoRows && autoRowsClass[autoRows],
          className
        )}
        style={{ gridAutoRows: autoRows === "min" ? "min-content" : autoRows === "max" ? "max-content" : "1fr" }}
        {...props}
      />
    );
  }
);
Grid.displayName = "Grid";

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6;
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, rowSpan, ...props }, ref) => {
    const colSpanClass = colSpan
      ? {
          1: "col-span-1",
          2: "col-span-1 lg:col-span-2",
          3: "col-span-1 lg:col-span-3",
          4: "col-span-1 lg:col-span-4",
          6: "col-span-1 lg:col-span-6",
          12: "col-span-1 lg:col-span-12",
        }[colSpan]
      : undefined;

    const rowSpanClass = rowSpan
      ? {
          1: "row-span-1",
          2: "row-span-2",
          3: "row-span-3",
          4: "row-span-4",
          5: "row-span-5",
          6: "row-span-6",
        }[rowSpan]
      : undefined;

    return (
      <div
        ref={ref}
        className={cn("h-full", colSpanClass, rowSpanClass, className)}
        {...props}
      />
    );
  }
);
GridItem.displayName = "GridItem";

export { Grid, GridItem };

