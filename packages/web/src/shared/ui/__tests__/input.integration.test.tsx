import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Input } from "../input";

describe("Input Integration Tests", () => {
  it("should render input element", () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toBeInTheDocument();
  });

  it("should handle user input", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText("Enter text");
    await user.type(input, "Hello World");

    expect(input).toHaveValue("Hello World");
  });

  it("should be disabled when disabled prop is set", () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText("Disabled input");
    expect(input).toBeDisabled();
  });

  it("should handle different input types", () => {
    const { rerender } = render(<Input type="text" placeholder="Text input" />);
    let input = screen.getByPlaceholderText("Text input");
    expect(input).toHaveAttribute("type", "text");

    rerender(<Input type="email" placeholder="Email input" />);
    input = screen.getByPlaceholderText("Email input");
    expect(input).toHaveAttribute("type", "email");
  });

  it("should call onChange handler", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input onChange={handleChange} placeholder="Test input" />);

    const input = screen.getByPlaceholderText("Test input");
    await user.type(input, "test");

    expect(handleChange).toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    render(<Input className="custom-class" placeholder="Custom input" />);
    const input = screen.getByPlaceholderText("Custom input");
    expect(input).toHaveClass("custom-class");
  });
});
