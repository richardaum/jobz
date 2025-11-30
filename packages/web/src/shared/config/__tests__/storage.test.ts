import { beforeEach, describe, expect, it, vi } from "vitest";

import { type SettingsStore, useSettingsStore } from "@/shared/stores";

import { getOpenAIApiKey } from "../storage";

// Mock the settings store
vi.mock("@/shared/stores", () => ({
  useSettingsStore: {
    getState: vi.fn(),
  },
}));

describe("getOpenAIApiKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return API key from store when available", () => {
    const mockApiKey = "sk-test-key-123";
    vi.mocked(useSettingsStore.getState).mockReturnValue({
      openaiApiKey: mockApiKey,
      setOpenAIApiKey: vi.fn(),
      getOpenAIApiKey: () => mockApiKey,
      isSettingsOpen: false,
      setIsSettingsOpen: vi.fn(),
    } as SettingsStore);

    const result = getOpenAIApiKey();
    expect(result).toBe(mockApiKey);
  });

  it("should return null when API key is not set", () => {
    vi.mocked(useSettingsStore.getState).mockReturnValue({
      openaiApiKey: "",
      setOpenAIApiKey: vi.fn(),
      getOpenAIApiKey: () => null,
      isSettingsOpen: false,
      setIsSettingsOpen: vi.fn(),
    } as SettingsStore);

    const result = getOpenAIApiKey();
    expect(result).toBeNull();
  });

  it("should return null when API key is empty string", () => {
    vi.mocked(useSettingsStore.getState).mockReturnValue({
      openaiApiKey: "",
      setOpenAIApiKey: vi.fn(),
      getOpenAIApiKey: () => "",
      isSettingsOpen: false,
      setIsSettingsOpen: vi.fn(),
    } as SettingsStore);

    const result = getOpenAIApiKey();
    expect(result).toBeNull();
  });

  it("should handle errors gracefully and return null", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(useSettingsStore.getState).mockReturnValue({
      openaiApiKey: "",
      setOpenAIApiKey: vi.fn(),
      getOpenAIApiKey: () => {
        throw new Error("Store error");
      },
      isSettingsOpen: false,
      setIsSettingsOpen: vi.fn(),
    } as SettingsStore);

    const result = getOpenAIApiKey();
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to get API key from store:", expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it("should return null when window is undefined (SSR)", () => {
    const originalWindow = global.window;
    // @ts-expect-error - intentionally removing window for SSR test
    delete global.window;

    const result = getOpenAIApiKey();
    expect(result).toBeNull();

    global.window = originalWindow;
  });
});
