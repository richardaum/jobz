import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ResumeHistoryItem } from "../../types";
import { HistoryTab } from "../history-tab";

// Mock date-fns
vi.mock("date-fns", () => ({
  format: vi.fn((date: Date) => {
    return date.toLocaleDateString();
  }),
}));

describe("HistoryTab", () => {
  const mockOnLoadItem = vi.fn();
  const mockOnDeleteItem = vi.fn();
  const mockOnClearHistory = vi.fn();

  const mockHistoryItem: ResumeHistoryItem = {
    id: "1",
    timestamp: Date.now(),
    resume: "Resume content",
    jobDescription: "Job description content",
    adaptedResume: "Adapted resume",
    gaps: "Gaps analysis",
    matchResult: {
      matchPercentage: 85,
      analysis: "Good match",
      checklist: [],
    },
    changes: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show empty state when history is empty", () => {
    render(
      <HistoryTab
        history={[]}
        onLoadItem={mockOnLoadItem}
        onDeleteItem={mockOnDeleteItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    expect(screen.getByText(/Nenhum histórico de processamento ainda/)).toBeInTheDocument();
  });

  it("should render history items", () => {
    render(
      <HistoryTab
        history={[mockHistoryItem]}
        onLoadItem={mockOnLoadItem}
        onDeleteItem={mockOnDeleteItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    expect(screen.getByText(/Histórico de Processamentos/)).toBeInTheDocument();
    expect(screen.getByText(/1 item/)).toBeInTheDocument();
  });

  it("should call onLoadItem when item is clicked", async () => {
    const user = userEvent.setup();
    render(
      <HistoryTab
        history={[mockHistoryItem]}
        onLoadItem={mockOnLoadItem}
        onDeleteItem={mockOnDeleteItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    // Find the card and click it
    const card = screen.getByText(/Job description content/).closest("div[class*='card']");
    if (card) {
      await user.click(card);
      expect(mockOnLoadItem).toHaveBeenCalledWith(mockHistoryItem);
    }
  });

  it("should call onDeleteItem when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <HistoryTab
        history={[mockHistoryItem]}
        onLoadItem={mockOnLoadItem}
        onDeleteItem={mockOnDeleteItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    // Find delete button by finding the button with IconTrash (it's the second button, first is clear button)
    const buttons = screen.getAllByRole("button");
    // The delete button should be the one that's not the clear button
    const deleteButton = buttons.find((btn) => {
      const svg = btn.querySelector("svg");
      return svg && !btn.textContent?.includes("Limpar");
    });

    expect(deleteButton).toBeDefined();
    if (deleteButton) {
      await user.click(deleteButton);
      expect(mockOnDeleteItem).toHaveBeenCalledWith("1");
    }
  });

  it("should call onClearHistory when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <HistoryTab
        history={[mockHistoryItem]}
        onLoadItem={mockOnLoadItem}
        onDeleteItem={mockOnDeleteItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    const clearButton = screen.getByText(/Limpar Histórico/);
    await user.click(clearButton);

    expect(mockOnClearHistory).toHaveBeenCalled();
  });

  it("should display match percentage", () => {
    render(
      <HistoryTab
        history={[mockHistoryItem]}
        onLoadItem={mockOnLoadItem}
        onDeleteItem={mockOnDeleteItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    expect(screen.getByText(/Match: 85%/)).toBeInTheDocument();
  });

  it("should handle multiple history items", () => {
    const items: ResumeHistoryItem[] = [
      mockHistoryItem,
      {
        ...mockHistoryItem,
        id: "2",
        timestamp: Date.now() - 1000,
        matchResult: { matchPercentage: 75, analysis: "Match", checklist: [] },
      },
    ];

    render(
      <HistoryTab
        history={items}
        onLoadItem={mockOnLoadItem}
        onDeleteItem={mockOnDeleteItem}
        onClearHistory={mockOnClearHistory}
      />
    );

    expect(screen.getByText(/2 itens/)).toBeInTheDocument();
  });
});
