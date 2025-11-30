import { IconFileText } from "@tabler/icons-react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GetStartListItem } from "../get-start-list-item";

describe("GetStartListItem", () => {
  const defaultProps = {
    icon: IconFileText,
    title: "Add Resume",
    completedTitle: "Resume Added",
    description: "Paste your resume",
    completedDescription: "Resume has been added",
    isCompleted: false,
  };

  it("should render with title when not completed", () => {
    render(<GetStartListItem {...defaultProps} />);

    expect(screen.getByText("Add Resume")).toBeInTheDocument();
    expect(screen.getByText("Paste your resume")).toBeInTheDocument();
  });

  it("should render with completed title when completed", () => {
    render(<GetStartListItem {...defaultProps} isCompleted={true} />);

    expect(screen.getByText("Resume Added")).toBeInTheDocument();
    expect(screen.getByText("Resume has been added")).toBeInTheDocument();
  });

  it("should apply primary styling when isPrimary and completed", () => {
    const { container } = render(<GetStartListItem {...defaultProps} isCompleted={true} isPrimary={true} />);

    const item = container.querySelector("div");
    expect(item).toHaveClass("bg-primary/10", "border-primary/20");
  });

  it("should apply muted styling when completed but not primary", () => {
    const { container } = render(<GetStartListItem {...defaultProps} isCompleted={true} isPrimary={false} />);

    const item = container.querySelector("div");
    expect(item).toHaveClass("bg-muted/50", "opacity-60");
  });

  it("should render icon", () => {
    const { container } = render(<GetStartListItem {...defaultProps} />);

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});
