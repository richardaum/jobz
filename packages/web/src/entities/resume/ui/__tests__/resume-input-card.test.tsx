import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ResumeInputCard } from "../resume-input-card";

describe("ResumeInputCard", () => {
  it("should render card with title and description", () => {
    const mockOnChange = vi.fn();
    render(<ResumeInputCard value="" onChange={mockOnChange} />);

    expect(screen.getByText("Resume")).toBeInTheDocument();
    expect(screen.getByText("Paste your current resume here")).toBeInTheDocument();
  });

  it("should display value", () => {
    const mockOnChange = vi.fn();
    render(<ResumeInputCard value="Resume content" onChange={mockOnChange} />);

    const textarea = screen.getByDisplayValue("Resume content");
    expect(textarea).toBeInTheDocument();
  });

  it("should call onChange when value changes", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<ResumeInputCard value="" onChange={mockOnChange} />);

    const textarea = screen.getByPlaceholderText("Paste your resume here...");
    await user.type(textarea, "New content");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should show placeholder when value is empty", () => {
    const mockOnChange = vi.fn();
    render(<ResumeInputCard value="" onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText("Paste your resume here...")).toBeInTheDocument();
  });
});
