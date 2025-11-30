import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PersonalPreferencesPopover } from "../personal-preferences-popover";

describe("PersonalPreferencesPopover", () => {
  it("should render trigger", () => {
    const mockOnChange = vi.fn();
    render(
      <PersonalPreferencesPopover value="" onChange={mockOnChange}>
        <button>Trigger</button>
      </PersonalPreferencesPopover>
    );

    expect(screen.getByText("Trigger")).toBeInTheDocument();
  });

  it("should render with value", () => {
    const mockOnChange = vi.fn();
    render(
      <PersonalPreferencesPopover value="Preferences" onChange={mockOnChange}>
        <button>Trigger</button>
      </PersonalPreferencesPopover>
    );

    expect(screen.getByText("Trigger")).toBeInTheDocument();
  });
});
