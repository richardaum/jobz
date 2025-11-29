import { beforeEach, describe, expect, it } from "vitest";

import { useSettingsStore } from "../settings-store";

describe("settings-store", () => {
  beforeEach(() => {
    // Reset store state
    useSettingsStore.setState({
      openaiApiKey: "",
      isSettingsOpen: false,
    });
    localStorage.clear();
  });

  it("should initialize with empty api key", () => {
    const apiKey = useSettingsStore.getState().openaiApiKey;
    expect(apiKey).toBe("");
  });

  it("should set OpenAI API key", () => {
    useSettingsStore.getState().setOpenAIApiKey("sk-test123");
    const apiKey = useSettingsStore.getState().openaiApiKey;
    expect(apiKey).toBe("sk-test123");
  });

  it("should trim API key when setting", () => {
    useSettingsStore.getState().setOpenAIApiKey("  sk-test123  ");
    const apiKey = useSettingsStore.getState().openaiApiKey;
    expect(apiKey).toBe("sk-test123");
  });

  it("should get OpenAI API key", () => {
    useSettingsStore.getState().setOpenAIApiKey("sk-test123");
    const apiKey = useSettingsStore.getState().getOpenAIApiKey();
    expect(apiKey).toBe("sk-test123");
  });

  it("should return null when API key is empty", () => {
    const apiKey = useSettingsStore.getState().getOpenAIApiKey();
    expect(apiKey).toBeNull();
  });

  it("should manage settings modal state", () => {
    expect(useSettingsStore.getState().isSettingsOpen).toBe(false);

    useSettingsStore.getState().setIsSettingsOpen(true);
    expect(useSettingsStore.getState().isSettingsOpen).toBe(true);

    useSettingsStore.getState().setIsSettingsOpen(false);
    expect(useSettingsStore.getState().isSettingsOpen).toBe(false);
  });
});
