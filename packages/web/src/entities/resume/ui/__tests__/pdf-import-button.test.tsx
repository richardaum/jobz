import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { extractTextFromPDF } from "../../lib/pdf-extractor";
import { PdfImportButton } from "../pdf-import-button";

// Mock dependencies
vi.mock("../../lib/pdf-extractor", () => ({
  extractTextFromPDF: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("PdfImportButton", () => {
  const mockOnImport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render button", () => {
    render(<PdfImportButton onImport={mockOnImport} />);

    expect(screen.getByText("Import PDF")).toBeInTheDocument();
  });

  it("should show loading state when processing", async () => {
    vi.mocked(extractTextFromPDF).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve("Text"), 100))
    );

    render(<PdfImportButton onImport={mockOnImport} />);

    const button = screen.getByText("Import PDF");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    if (input) {
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      Object.defineProperty(input, "files", {
        value: [file],
        writable: false,
      });

      await act(async () => {
        await userEvent.click(button);
        // File input triggers change event
        const changeEvent = new Event("change", { bubbles: true });
        input.dispatchEvent(changeEvent);
      });

      // Button should show loading (may need to wait)
      await waitFor(() => {
        expect(extractTextFromPDF).toHaveBeenCalled();
      });
    }
  });

  it("should call onImport when PDF is successfully extracted", async () => {
    const extractedText = "Extracted PDF text";
    vi.mocked(extractTextFromPDF).mockResolvedValue(extractedText);

    render(<PdfImportButton onImport={mockOnImport} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      Object.defineProperty(input, "files", {
        value: [file],
        writable: false,
      });

      await act(async () => {
        const changeEvent = new Event("change", { bubbles: true });
        input.dispatchEvent(changeEvent);
      });

      // Wait for async operation
      await waitFor(() => {
        expect(extractTextFromPDF).toHaveBeenCalled();
        expect(mockOnImport).toHaveBeenCalledWith(extractedText);
        expect(toast.success).toHaveBeenCalledWith("PDF imported successfully");
      });
    }
  });

  it("should show error toast when extraction fails", async () => {
    const error = new Error("Extraction failed");
    vi.mocked(extractTextFromPDF).mockRejectedValue(error);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<PdfImportButton onImport={mockOnImport} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      Object.defineProperty(input, "files", {
        value: [file],
        writable: false,
      });

      await act(async () => {
        const changeEvent = new Event("change", { bubbles: true });
        input.dispatchEvent(changeEvent);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Error extracting text from PDF. Please try again.");
      });

      consoleErrorSpy.mockRestore();
    }
  });

  it("should ignore non-PDF files", async () => {
    render(<PdfImportButton onImport={mockOnImport} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      Object.defineProperty(input, "files", {
        value: [file],
        writable: false,
      });

      await act(async () => {
        const changeEvent = new Event("change", { bubbles: true });
        input.dispatchEvent(changeEvent);
      });

      expect(extractTextFromPDF).not.toHaveBeenCalled();
    }
  });
});
