import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock all dependencies before importing
vi.mock("@tanstack/react-query");
vi.mock("sonner");

describe("Providers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export Providers function", async () => {
    const { Providers } = await import("../index");
    expect(typeof Providers).toBe("function");
  });

  it("should be importable", async () => {
    await expect(import("../index")).resolves.toHaveProperty("Providers");
  });
});
