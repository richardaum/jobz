import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Grid, GridItem } from "../grid";

describe("Grid", () => {
  it("should render grid", () => {
    const { container } = render(<Grid>Content</Grid>);
    const grid = container.querySelector("div");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("grid");
  });

  it("should render with default cols", () => {
    const { container } = render(<Grid>Content</Grid>);
    const grid = container.querySelector("div");
    expect(grid).toHaveClass("grid-cols-1");
  });

  it("should render with 2 cols", () => {
    const { container } = render(<Grid cols={2}>Content</Grid>);
    const grid = container.querySelector("div");
    expect(grid).toHaveClass("grid-cols-1", "lg:grid-cols-2");
  });

  it("should render with 3 cols", () => {
    const { container } = render(<Grid cols={3}>Content</Grid>);
    const grid = container.querySelector("div");
    expect(grid).toHaveClass("grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3");
  });

  it("should render with gap", () => {
    const { container } = render(<Grid gap="sm">Content</Grid>);
    const grid = container.querySelector("div");
    expect(grid).toHaveClass("gap-2", "sm:gap-3");
  });

  it("should render with autoRows", () => {
    const { container } = render(<Grid autoRows="min">Content</Grid>);
    const grid = container.querySelector("div");
    expect(grid).toHaveClass("auto-rows-min");
  });

  it("should apply custom className", () => {
    const { container } = render(<Grid className="custom-class">Content</Grid>);
    const grid = container.querySelector("div");
    expect(grid).toHaveClass("custom-class");
  });

  it("should forward ref", () => {
    const ref = { current: null };
    render(<Grid ref={ref}>Content</Grid>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("GridItem", () => {
  it("should render grid item", () => {
    const { container } = render(<GridItem>Content</GridItem>);
    const item = container.querySelector("div");
    expect(item).toBeInTheDocument();
  });

  it("should render with colSpan", () => {
    const { container } = render(<GridItem colSpan={2}>Content</GridItem>);
    const item = container.querySelector("div");
    expect(item).toHaveClass("col-span-1", "lg:col-span-2");
  });

  it("should render with rowSpan", () => {
    const { container } = render(<GridItem rowSpan={3}>Content</GridItem>);
    const item = container.querySelector("div");
    expect(item).toHaveClass("row-span-3");
  });

  it("should apply custom className", () => {
    const { container } = render(<GridItem className="custom-class">Content</GridItem>);
    const item = container.querySelector("div");
    expect(item).toHaveClass("custom-class");
  });

  it("should forward ref", () => {
    const ref = { current: null };
    render(<GridItem ref={ref}>Content</GridItem>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
