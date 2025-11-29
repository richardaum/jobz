import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { copyToClipboard } from "../clipboard";

describe("copyToClipboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should copy text to clipboard successfully", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: {
        writeText: mockWriteText,
      },
    });

    const result = await copyToClipboard("test text");
    expect(result).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith("test text");
  });

  it("should return false when clipboard API is not available", async () => {
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: undefined,
    });

    const result = await copyToClipboard("test text");
    expect(result).toBe(false);
  });

  it("should return false when writeText is not available", async () => {
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: {},
    });

    const result = await copyToClipboard("test text");
    expect(result).toBe(false);
  });

  it("should return false when clipboard write fails", async () => {
    const mockWriteText = vi.fn().mockRejectedValue(new Error("Failed"));
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: {
        writeText: mockWriteText,
      },
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await copyToClipboard("test text");
    expect(result).toBe(false);
    expect(mockWriteText).toHaveBeenCalledWith("test text");
    consoleSpy.mockRestore();
  });
});
