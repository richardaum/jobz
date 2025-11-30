import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type SettingsStore, useSettingsStore } from "@/shared/stores";

import { AppBar } from "../app-bar";

// Mock the store
vi.mock("@/shared/stores", () => ({
  useSettingsStore: vi.fn(),
}));

// Mock SettingsModal
vi.mock("@/shared/components", () => ({
  SettingsModal: ({ open }: { open: boolean; onOpenChange: (open: boolean) => void }) =>
    open ? <div data-testid="settings-modal">Settings Modal</div> : null,
}));

describe("AppBar", () => {
  beforeEach(() => {
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
  });

  it("should render header with title", () => {
    render(<AppBar />);
    expect(screen.getByText("Jobz")).toBeInTheDocument();
  });

  it("should render settings button", () => {
    render(<AppBar />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
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

    render(<AppBar />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockSetIsSettingsOpen).toHaveBeenCalledWith(true);
  });
});
