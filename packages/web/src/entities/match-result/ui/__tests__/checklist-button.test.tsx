import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChecklistButton } from "../checklist-button";

describe("ChecklistButton", () => {
  it("should render button when no checklist", () => {
    render(<ChecklistButton checklist={null} />);

    expect(screen.getByText("Checklist")).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should render button with count when checklist exists", () => {
    const checklist = [
      { category: "Skill 1", checked: true, description: "Description 1" },
      { category: "Skill 2", checked: false, description: "Description 2" },
      { category: "Skill 3", checked: true, description: "Description 3" },
    ];

    render(<ChecklistButton checklist={checklist} />);

    expect(screen.getByText("Checklist: 2/3")).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });

  it("should handle empty checklist array", () => {
    render(<ChecklistButton checklist={[]} />);

    expect(screen.getByText("Checklist")).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should show all checked items", () => {
    const checklist = [
      { category: "Skill 1", checked: true, description: "Description 1" },
      { category: "Skill 2", checked: true, description: "Description 2" },
    ];

    render(<ChecklistButton checklist={checklist} />);

    expect(screen.getByText("Checklist: 2/2")).toBeInTheDocument();
  });

  it("should show all unchecked items", () => {
    const checklist = [
      { category: "Skill 1", checked: false, description: "Description 1" },
      { category: "Skill 2", checked: false, description: "Description 2" },
    ];

    render(<ChecklistButton checklist={checklist} />);

    expect(screen.getByText("Checklist: 0/2")).toBeInTheDocument();
  });
});
