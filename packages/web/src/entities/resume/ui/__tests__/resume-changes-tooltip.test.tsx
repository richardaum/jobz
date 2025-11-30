import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResumeChangesTooltip } from "../resume-changes-tooltip";

describe("ResumeChangesTooltip", () => {
  it("should not render when no changes and not loading", () => {
    const { container } = render(<ResumeChangesTooltip changes={[]} hasValue={false} isLoading={false} />);

    expect(container.firstChild).toBeNull();
  });

  it("should render when there are changes", () => {
    const changes = [{ type: "added", section: "Experience", content: "Content", description: "Added experience" }];

    render(<ResumeChangesTooltip changes={changes} hasValue={true} isLoading={false} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "View changes made to resume");
  });

  it("should render when loading", () => {
    render(<ResumeChangesTooltip changes={[]} hasValue={false} isLoading={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should not render when has changes but no value", () => {
    const changes = [{ type: "added", section: "Experience", content: "Content", description: "Desc" }];

    const { container } = render(<ResumeChangesTooltip changes={changes} hasValue={false} isLoading={false} />);

    expect(container.firstChild).toBeNull();
  });
});
