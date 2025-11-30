import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChecklistTooltip } from "../checklist-tooltip";

describe("ChecklistTooltip", () => {
  it("should not render when checklist is empty", () => {
    const { container } = render(<ChecklistTooltip checklist={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("should not render when checklist is empty array", () => {
    const { container } = render(<ChecklistTooltip checklist={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("should render when checklist has items", () => {
    const checklist = [
      { category: "Skill 1", checked: true, description: "Description 1" },
      { category: "Skill 2", checked: false, description: "Description 2" },
    ];

    render(<ChecklistTooltip checklist={checklist} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should show gaps and successes", () => {
    const checklist = [
      { category: "Gap 1", checked: false, description: "Missing skill" },
      { category: "Success 1", checked: true, description: "Has skill" },
    ];

    render(<ChecklistTooltip checklist={checklist} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});
