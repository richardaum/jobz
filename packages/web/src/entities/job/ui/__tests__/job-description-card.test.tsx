import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { JobDescriptionCard } from "../job-description-card";

// Mock dependencies
vi.mock("@/entities/match-result/ui/checklist-tooltip", () => ({
  ChecklistTooltip: () => null,
}));

vi.mock("@/entities/match-result/ui/job-match-tooltip", () => ({
  JobMatchTooltip: () => null,
}));

describe("JobDescriptionCard", () => {
  it("should render card with title", () => {
    const mockOnChange = vi.fn();
    render(
      <JobDescriptionCard value="" onChange={mockOnChange} matchResult={null} isMatching={false} hasResume={false} />
    );

    // "Job Description" appears in both CardTitle and Label, so use getAllByText
    const titles = screen.getAllByText("Job Description");
    expect(titles.length).toBeGreaterThan(0);
  });

  it("should display value", () => {
    const mockOnChange = vi.fn();
    render(
      <JobDescriptionCard
        value="Job description"
        onChange={mockOnChange}
        matchResult={null}
        isMatching={false}
        hasResume={true}
      />
    );

    const textarea = screen.getByDisplayValue("Job description");
    expect(textarea).toBeInTheDocument();
  });

  it("should call onChange when value changes", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(
      <JobDescriptionCard value="" onChange={mockOnChange} matchResult={null} isMatching={false} hasResume={false} />
    );

    const textarea = screen.getByPlaceholderText("Paste the job description here...");
    await user.type(textarea, "New job");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should render with match result", () => {
    const mockOnChange = vi.fn();
    const matchResult = {
      matchPercentage: 85,
      analysis: "Good match",
      checklist: [],
    };

    render(
      <JobDescriptionCard
        value="Job"
        onChange={mockOnChange}
        matchResult={matchResult}
        isMatching={false}
        hasResume={true}
      />
    );

    // "Job Description" appears in both CardTitle and Label, so use getAllByText
    const titles = screen.getAllByText("Job Description");
    expect(titles.length).toBeGreaterThan(0);
  });
});
