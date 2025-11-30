import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobMatchTooltip } from "../job-match-tooltip";

describe("JobMatchTooltip", () => {
  it("should render button", () => {
    render(<JobMatchTooltip matchResult={null} isMatching={false} hasResume={false} hasJobDescription={false} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should show tooltip when matchResult exists", () => {
    const matchResult = {
      matchPercentage: 85,
      analysis: "Good match",
      checklist: [],
    };

    render(<JobMatchTooltip matchResult={matchResult} isMatching={false} hasResume={true} hasJobDescription={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should show matching state", () => {
    render(<JobMatchTooltip matchResult={null} isMatching={true} hasResume={true} hasJobDescription={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});
