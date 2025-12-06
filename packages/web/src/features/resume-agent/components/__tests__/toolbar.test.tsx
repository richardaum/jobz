import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type CardsVisibilityState, useCardsVisibilityStore } from "../../stores/cards-visibility-store";
import { type ResumeStore, useResumeStore } from "../../stores/resume-store";
import { Toolbar } from "../toolbar";

// Mock dependencies
vi.mock("../../stores/resume-store");
vi.mock("../../stores/cards-visibility-store");
vi.mock("../history-modal", () => ({
  HistoryModal: ({ open }: { open: boolean }) => (open ? <div data-testid="history-modal">History Modal</div> : null),
}));
vi.mock("../prompt-modal", () => ({
  PromptModal: ({ open }: { open: boolean }) => (open ? <div data-testid="prompt-modal">Prompt Modal</div> : null),
}));
vi.mock("@/entities/job", () => ({
  JobDescriptionPopover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PersonalPreferencesPopover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/entities/resume", () => ({
  ResumePopover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/entities/match-result", () => ({
  ChecklistButton: () => <button>Checklist</button>,
  JobMatchButton: () => <button>Match</button>,
}));

describe("Toolbar", () => {
  const mockOnProcess = vi.fn();
  const mockSetResume = vi.fn();
  const mockSetJobDescription = vi.fn();
  const mockSetPersonalPreferences = vi.fn();
  const mockClearResults = vi.fn();
  const mockClearAll = vi.fn();
  const mockShowCard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.confirm = vi.fn(() => true);

    vi.mocked(useResumeStore).mockImplementation((selector: (state: ResumeStore) => unknown) => {
      const state: ResumeStore = {
        resume: "",
        jobDescription: "",
        personalPreferences: "",
        setResume: mockSetResume,
        setJobDescription: mockSetJobDescription,
        setPersonalPreferences: mockSetPersonalPreferences,
        adaptedResume: "",
        sections: [],
        gaps: "",
        matchResult: null,
        changes: [],
        rawResponseJson: null,
        updateOutputs: vi.fn(),
        hasValidInputs: () => true,
        clearResults: mockClearResults,
        clearAll: mockClearAll,
      };
      return selector(state);
    });

    vi.mocked(useCardsVisibilityStore).mockImplementation((selector: (state: CardsVisibilityState) => unknown) => {
      const state: CardsVisibilityState = {
        visibleCards: new Set(["adapted-resume", "gaps-analysis"]),
        showCard: mockShowCard,
        toggleCard: vi.fn(),
        hideCard: vi.fn(),
        showAllCards: vi.fn(),
        hideAllCards: vi.fn(),
      };
      return selector(state);
    });
  });

  it("should render toolbar with buttons", () => {
    render(<Toolbar onProcess={mockOnProcess} isProcessing={false} matchResult={null} isMatching={false} />);

    expect(screen.getByText("Add Resume")).toBeInTheDocument();
    expect(screen.getByText("Add Job Description")).toBeInTheDocument();
    expect(screen.getByText("Start 🚀")).toBeInTheDocument();
  });

  it("should call onProcess when start button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(useResumeStore).mockImplementation((selector: (state: ResumeStore) => unknown) => {
      const state: ResumeStore = {
        resume: "Resume content",
        jobDescription: "Job description",
        personalPreferences: "",
        setResume: mockSetResume,
        setJobDescription: mockSetJobDescription,
        setPersonalPreferences: mockSetPersonalPreferences,
        adaptedResume: "",
        sections: [],
        gaps: "",
        matchResult: null,
        changes: [],
        rawResponseJson: null,
        updateOutputs: vi.fn(),
        hasValidInputs: () => true,
        clearResults: mockClearResults,
        clearAll: mockClearAll,
      };
      return selector(state);
    });

    render(<Toolbar onProcess={mockOnProcess} isProcessing={false} matchResult={null} isMatching={false} />);

    const startButton = screen.getByText("Start 🚀");
    await user.click(startButton);

    expect(mockOnProcess).toHaveBeenCalledTimes(1);
  });

  it("should disable start button when processing", () => {
    render(<Toolbar onProcess={mockOnProcess} isProcessing={true} matchResult={null} isMatching={false} />);

    const startButton = screen.getByText("Processing...");
    expect(startButton).toBeDisabled();
  });

  it("should show history modal when history button is clicked", async () => {
    const user = userEvent.setup();
    render(<Toolbar onProcess={mockOnProcess} isProcessing={false} matchResult={null} isMatching={false} />);

    const historyButton = screen.getByText("History");
    await user.click(historyButton);

    expect(screen.getByTestId("history-modal")).toBeInTheDocument();
  });

  it("should show prompt modal when prompt button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(useResumeStore).mockImplementation((selector: (state: ResumeStore) => unknown) => {
      const state: ResumeStore = {
        resume: "Resume",
        jobDescription: "Job",
        personalPreferences: "",
        setResume: mockSetResume,
        setJobDescription: mockSetJobDescription,
        setPersonalPreferences: mockSetPersonalPreferences,
        adaptedResume: "",
        sections: [],
        gaps: "",
        matchResult: null,
        changes: [],
        rawResponseJson: null,
        updateOutputs: vi.fn(),
        hasValidInputs: () => true,
        clearResults: mockClearResults,
        clearAll: mockClearAll,
      };
      return selector(state);
    });

    render(<Toolbar onProcess={mockOnProcess} isProcessing={false} matchResult={null} isMatching={false} />);

    const promptButton = screen.getByText("Show Prompt");
    await user.click(promptButton);

    expect(screen.getByTestId("prompt-modal")).toBeInTheDocument();
  });

  it("should clear results when clear results is clicked", async () => {
    const user = userEvent.setup();
    render(<Toolbar onProcess={mockOnProcess} isProcessing={false} matchResult={null} isMatching={false} />);

    const clearButton = screen.getByText("Clear");
    await user.click(clearButton);

    const clearResultsOption = screen.getByText("Clear Results");
    await user.click(clearResultsOption);

    expect(mockClearResults).toHaveBeenCalled();
  });

  it("should show card buttons when cards are hidden", () => {
    vi.mocked(useCardsVisibilityStore).mockImplementation((selector: (state: CardsVisibilityState) => unknown) => {
      const state: CardsVisibilityState = {
        visibleCards: new Set(),
        showCard: mockShowCard,
        toggleCard: vi.fn(),
        hideCard: vi.fn(),
        showAllCards: vi.fn(),
        hideAllCards: vi.fn(),
      };
      return selector(state);
    });

    render(<Toolbar onProcess={mockOnProcess} isProcessing={false} matchResult={null} isMatching={false} />);

    expect(screen.getByText("Show Adapted Resume")).toBeInTheDocument();
    expect(screen.getByText("Show Gaps Analysis")).toBeInTheDocument();
  });
});
