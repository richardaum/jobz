import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Divider } from "../divider";

describe("Divider", () => {
  it("should render divider", () => {
    const { container } = render(<Divider />);
    const divider = container.querySelector("div");
    expect(divider).toBeInTheDocument();
  });

  it("should render vertical divider by default", () => {
    const { container } = render(<Divider />);
    const divider = container.querySelector("div");
    expect(divider).toHaveClass("w-px", "h-4");
  });

  it("should render horizontal divider", () => {
    const { container } = render(<Divider orientation="horizontal" />);
    const divider = container.querySelector("div");
    expect(divider).toHaveClass("h-px", "w-full");
  });

  it("should apply custom className", () => {
    const { container } = render(<Divider className="custom-class" />);
    const divider = container.querySelector("div");
    expect(divider).toHaveClass("custom-class");
  });

  it("should forward ref", () => {
    const ref = { current: null };
    render(<Divider ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
