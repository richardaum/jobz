import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ResumePopover } from "../resume-popover";

// Mock PdfImportButton
vi.mock("../pdf-import-button", () => ({
  PdfImportButton: () => <button>Import PDF</button>,
}));

describe("ResumePopover", () => {
  it("should render trigger", () => {
    const mockOnChange = vi.fn();
    render(
      <ResumePopover value="" onChange={mockOnChange}>
        <button>Trigger</button>
      </ResumePopover>
    );

    expect(screen.getByText("Trigger")).toBeInTheDocument();
  });

  it("should render with value", () => {
    const mockOnChange = vi.fn();
    render(
      <ResumePopover value="Resume content" onChange={mockOnChange}>
        <button>Trigger</button>
      </ResumePopover>
    );

    expect(screen.getByText("Trigger")).toBeInTheDocument();
  });
});
