import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "../empty-state";

describe("EmptyState Integration Tests", () => {
  it("should render empty state when no inputs are provided", () => {
    render(<EmptyState hasResume={false} hasJobDescription={false} />);
    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(screen.getByText("Add your resume and job description to begin processing")).toBeInTheDocument();
  });

  it("should show resume as not completed when hasResume is false", () => {
    render(<EmptyState hasResume={false} hasJobDescription={false} />);
    expect(screen.getByText("Add Resume")).toBeInTheDocument();
    expect(screen.getByText("Click 'Add Resume' in the toolbar to paste your current resume.")).toBeInTheDocument();
  });

  it("should show resume as completed when hasResume is true", () => {
    render(<EmptyState hasResume={true} hasJobDescription={false} />);
    expect(screen.getByText("Resume Added")).toBeInTheDocument();
    expect(screen.getByText("Your resume has been added. You can edit it from the toolbar.")).toBeInTheDocument();
  });

  it("should show job description as not completed when hasJobDescription is false", () => {
    render(<EmptyState hasResume={false} hasJobDescription={false} />);
    expect(screen.getByText("Add Job Description")).toBeInTheDocument();
    expect(
      screen.getByText("Click 'Add Job Description' in the toolbar to paste the job posting.")
    ).toBeInTheDocument();
  });

  it("should show job description as completed when hasJobDescription is true", () => {
    render(<EmptyState hasResume={false} hasJobDescription={true} />);
    expect(screen.getByText("Job Description Added")).toBeInTheDocument();
    expect(screen.getByText("Job description has been added. You can edit it from the toolbar.")).toBeInTheDocument();
  });

  it("should show process step as not ready when inputs are missing", () => {
    render(<EmptyState hasResume={false} hasJobDescription={false} />);
    expect(screen.getByText("Process Your Resume")).toBeInTheDocument();
  });

  it("should show process step as ready when both inputs are provided", () => {
    render(<EmptyState hasResume={true} hasJobDescription={true} />);
    expect(screen.getByText("Ready to Process")).toBeInTheDocument();
    // Check for parts of the text separately since it might be split across elements
    expect(screen.getByText(/Click the/i)).toBeInTheDocument();
    expect(screen.getByText(/Start 🚀/i)).toBeInTheDocument();
  });
});
