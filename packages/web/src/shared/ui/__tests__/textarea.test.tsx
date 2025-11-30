import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Textarea } from "../textarea";

describe("Textarea", () => {
  it("should render textarea", () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
  });

  it("should render with placeholder", () => {
    render(<Textarea placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText("Enter text");
    expect(textarea).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<Textarea className="custom-class" />);
    const textarea = container.querySelector("textarea");
    expect(textarea).toHaveClass("custom-class");
  });

  it("should be disabled when disabled prop is set", () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
  });

  it("should handle value changes", async () => {
    const user = userEvent.setup();
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");

    await user.type(textarea, "Test input");
    expect(textarea).toHaveValue("Test input");
  });

  it("should forward ref", () => {
    const ref = { current: null };
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("should pass through HTML attributes", () => {
    render(<Textarea rows={5} cols={30} data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("rows", "5");
    expect(textarea).toHaveAttribute("cols", "30");
  });
});
