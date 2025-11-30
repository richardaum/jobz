import { describe, expect, it, vi } from "vitest";

import { extractTextFromPDF } from "../pdf-extractor";

// Mock pdfjs-dist to avoid actual PDF processing in tests
vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: {
    workerSrc: "",
  },
  version: "4.10.38",
  getDocument: vi.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 1,
      getPage: vi.fn().mockResolvedValue({
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ str: "Test PDF content" }],
        }),
      }),
    }),
  }),
}));

describe("extractTextFromPDF", () => {
  it("should be a function", () => {
    expect(typeof extractTextFromPDF).toBe("function");
  });

  it("should extract text from PDF file", async () => {
    const arrayBuffer = new ArrayBuffer(8);
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    const mockFile = Object.assign(new File([blob], "test.pdf", { type: "application/pdf" }), {
      arrayBuffer: async () => arrayBuffer,
    });

    const result = await extractTextFromPDF(mockFile);

    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("should handle file input", async () => {
    const arrayBuffer = new ArrayBuffer(8);
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    const mockFile = Object.assign(new File([blob], "test.pdf", { type: "application/pdf" }), {
      arrayBuffer: async () => arrayBuffer,
    });

    // Should not throw
    await expect(extractTextFromPDF(mockFile)).resolves.toBeDefined();
  });
});
