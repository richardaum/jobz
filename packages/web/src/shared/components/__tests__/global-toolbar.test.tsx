import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { type SettingsStore, useSettingsStore } from "@/shared/stores";

import { GlobalToolbar } from "../global-toolbar";

// Mock the store
vi.mock("@/shared/stores", () => ({
  useSettingsStore: vi.fn(),
}));

// Mock SettingsModal
vi.mock("@/shared/components", () => ({
  SettingsModal: ({ open }: { open: boolean; onOpenChange: (open: boolean) => void }) =>
    open ? <div data-testid="settings-modal">Settings Modal</div> : null,
}));

describe("GlobalToolbar", () => {
  it("should render settings button", () => {
    const mockSetIsSettingsOpen = vi.fn();
    vi.mocked(useSettingsStore).mockImplementation((selector: (state: SettingsStore) => unknown) => {
      const state: SettingsStore = {
        openaiApiKey: "",
        setOpenAIApiKey: vi.fn(),
        getOpenAIApiKey: () => null,
        isSettingsOpen: false,
        setIsSettingsOpen: mockSetIsSettingsOpen,
      };
      return selector(state);
    });

    render(<GlobalToolbar />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("should open settings modal when button is clicked", async () => {
    const user = userEvent.setup();
    const mockSetIsSettingsOpen = vi.fn();

    vi.mocked(useSettingsStore).mockImplementation((selector: (state: SettingsStore) => unknown) => {
      const state: SettingsStore = {
        openaiApiKey: "",
        setOpenAIApiKey: vi.fn(),
        getOpenAIApiKey: () => null,
        isSettingsOpen: false,
        setIsSettingsOpen: mockSetIsSettingsOpen,
      };
      return selector(state);
    });

    render(<GlobalToolbar />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockSetIsSettingsOpen).toHaveBeenCalledWith(true);
  });
});
