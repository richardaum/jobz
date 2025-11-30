import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdaptedResumeButton } from "../adapted-resume-button";

describe("AdaptedResumeButton", () => {
  it("should not render when no changes and not loading", () => {
    const { container } = render(<AdaptedResumeButton changes={[]} hasValue={false} isLoading={false} />);

    expect(container.firstChild).toBeNull();
  });

  it("should render when there are changes", () => {
    const changes = [
      { type: "added", section: "Experience", content: "New experience", description: "Added new experience" },
    ];

    render(<AdaptedResumeButton changes={changes} hasValue={true} isLoading={false} />);

    expect(screen.getByText("Changes")).toBeInTheDocument();
  });

  it("should render when loading", () => {
    render(<AdaptedResumeButton changes={[]} hasValue={false} isLoading={true} />);

    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("should show changes in tooltip", () => {
    const changes = [
      { type: "added", section: "Experience", content: "Content", description: "Added experience" },
      { type: "modified", section: "Skills", content: "Content", description: "Updated skills" },
    ];

    render(<AdaptedResumeButton changes={changes} hasValue={true} isLoading={false} />);

    expect(screen.getByText("Changes")).toBeInTheDocument();
  });

  it("should not render when has changes but no value", () => {
    const changes = [{ type: "added", section: "Experience", content: "Content", description: "Desc" }];

    const { container } = render(<AdaptedResumeButton changes={changes} hasValue={false} isLoading={false} />);

    expect(container.firstChild).toBeNull();
  });
});
