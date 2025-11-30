import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Loading from "../loading";

describe("Loading", () => {
  it("should render loading message", () => {
    render(<Loading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should have correct structure", () => {
    const { container } = render(<Loading />);
    const div = container.querySelector("div");
    expect(div).toBeInTheDocument();
  });
});
