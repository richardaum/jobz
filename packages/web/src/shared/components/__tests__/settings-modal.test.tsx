import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type SettingsStore, useSettingsStore } from "@/shared/stores";

import { SettingsModal } from "../settings-modal";

// Mock the store
vi.mock("@/shared/stores", () => ({
  useSettingsStore: vi.fn(),
}));

describe("SettingsModal", () => {
  const mockSetOpenAIApiKey = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettingsStore).mockImplementation((selector: (state: SettingsStore) => unknown) => {
      const state: SettingsStore = {
        openaiApiKey: "",
        setOpenAIApiKey: mockSetOpenAIApiKey,
        getOpenAIApiKey: () => null,
        isSettingsOpen: false,
        setIsSettingsOpen: vi.fn(),
      };
      return selector(state);
    });
  });

  it("should render when open", () => {
    render(<SettingsModal open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Configure your application settings")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(<SettingsModal open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("should load API key from store when opened", () => {
    vi.mocked(useSettingsStore).mockImplementation((selector: (state: SettingsStore) => unknown) => {
      const state: SettingsStore = {
        openaiApiKey: "sk-test-key",
        setOpenAIApiKey: mockSetOpenAIApiKey,
        getOpenAIApiKey: () => "sk-test-key",
        isSettingsOpen: false,
        setIsSettingsOpen: vi.fn(),
      };
      return selector(state);
    });

    render(<SettingsModal open={true} onOpenChange={vi.fn()} />);
    const input = screen.getByPlaceholderText("sk-...") as HTMLInputElement;
    expect(input.value).toBe("sk-test-key");
  });

  it("should update API key input", async () => {
    const user = userEvent.setup();
    render(<SettingsModal open={true} onOpenChange={vi.fn()} />);

    const input = screen.getByPlaceholderText("sk-...") as HTMLInputElement;
    await user.type(input, "sk-new-key");

    expect(input.value).toBe("sk-new-key");
  });

  it("should save API key when save button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();

    render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

    const input = screen.getByPlaceholderText("sk-...");
    await user.type(input, "sk-test-key");

    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    expect(mockSetOpenAIApiKey).toHaveBeenCalledWith("sk-test-key");
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should close modal when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();

    render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
