import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Label } from "../label";

describe("Label", () => {
  it("should render label with text", () => {
    const { getByText } = render(<Label>Test Label</Label>);
    expect(getByText("Test Label")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<Label className="custom-class">Label</Label>);
    const label = container.querySelector("label");
    expect(label).toHaveClass("custom-class");
  });

  it("should forward ref", () => {
    const ref = { current: null };
    render(<Label ref={ref}>Label</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it("should pass through HTML attributes", () => {
    const { container } = render(
      <Label htmlFor="input-id" data-testid="label">
        Label
      </Label>
    );
    const label = container.querySelector("label");
    expect(label).toHaveAttribute("for", "input-id");
    expect(label).toHaveAttribute("data-testid", "label");
  });

  it("should have default styling classes", () => {
    const { container } = render(<Label>Label</Label>);
    const label = container.querySelector("label");
    expect(label).toHaveClass("text-sm", "font-medium", "leading-none");
  });
});
