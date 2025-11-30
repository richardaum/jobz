import { jsPDF } from "jspdf";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { downloadResumeAsPDF } from "../download-pdf";
import { formatForPDF } from "../format-pdf";
import { sanitizeForPDF } from "../sanitize-pdf";

// Mock dependencies
vi.mock("../format-pdf", () => ({
  formatForPDF: vi.fn((content) => content),
}));

vi.mock("../sanitize-pdf", () => ({
  sanitizeForPDF: vi.fn((content) => content),
}));

const mockDoc = {
  setFontSize: vi.fn(),
  internal: {
    pageSize: {
      getWidth: () => 210,
      getHeight: () => 297,
    },
  },
  splitTextToSize: vi.fn((text: string) => [text]),
  text: vi.fn(),
  addPage: vi.fn(),
  save: vi.fn(),
};

vi.mock("jspdf", () => ({
  jsPDF: vi.fn(() => mockDoc),
}));

describe("downloadResumeAsPDF", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should be a function", () => {
    expect(typeof downloadResumeAsPDF).toBe("function");
  });

  it("should not download PDF when content is empty", () => {
    downloadResumeAsPDF("");
    const MockedJsPDF = vi.mocked(jsPDF);
    expect(MockedJsPDF).not.toHaveBeenCalled();
  });

  it("should not download PDF when content is only whitespace", () => {
    downloadResumeAsPDF("   \n\t  ");
    const MockedJsPDF = vi.mocked(jsPDF);
    expect(MockedJsPDF).not.toHaveBeenCalled();
  });

  it("should sanitize and format content before generating PDF", () => {
    const content = "Test Resume Content";
    downloadResumeAsPDF(content);

    expect(sanitizeForPDF).toHaveBeenCalledWith(content);
    expect(formatForPDF).toHaveBeenCalledWith(content);
  });

  it("should create PDF with content", () => {
    const content = "Test Resume\nContent";
    downloadResumeAsPDF(content, "test-resume.pdf");

    const MockedJsPDF = vi.mocked(jsPDF);
    expect(MockedJsPDF).toHaveBeenCalled();

    expect(mockDoc.setFontSize).toHaveBeenCalledWith(9);
    expect(mockDoc.save).toHaveBeenCalledWith("test-resume.pdf");
  });

  it("should use default filename when not provided", () => {
    const content = "Test Resume";
    downloadResumeAsPDF(content);

    expect(mockDoc.save).toHaveBeenCalledWith("adapted-resume.pdf");
  });
});
