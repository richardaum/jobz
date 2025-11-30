import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobMatchButton } from "../job-match-button";

describe("JobMatchButton", () => {
  it("should render button", () => {
    render(<JobMatchButton matchResult={null} isMatching={false} hasResume={false} hasJobDescription={false} />);

    expect(screen.getByText("Job Match")).toBeInTheDocument();
  });

  it("should be disabled when no resume or job description", () => {
    render(<JobMatchButton matchResult={null} isMatching={false} hasResume={false} hasJobDescription={false} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should show match percentage when matchResult exists", () => {
    const matchResult = {
      matchPercentage: 85,
      analysis: "Good match",
      checklist: [],
    };

    render(<JobMatchButton matchResult={matchResult} isMatching={false} hasResume={true} hasJobDescription={true} />);

    expect(screen.getByText("Match: 85%")).toBeInTheDocument();
  });

  it("should show matching state", () => {
    render(<JobMatchButton matchResult={null} isMatching={true} hasResume={true} hasJobDescription={true} />);

    expect(screen.getByText("Matching...")).toBeInTheDocument();
  });

  it("should be enabled when has data and match result", () => {
    const matchResult = {
      matchPercentage: 75,
      analysis: "Match",
      checklist: [],
    };

    render(<JobMatchButton matchResult={matchResult} isMatching={false} hasResume={true} hasJobDescription={true} />);

    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });
});
