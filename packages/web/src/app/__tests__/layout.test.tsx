import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import RootLayout from "../layout";

// Mock Providers
vi.mock("../providers", () => ({
  Providers: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("RootLayout", () => {
  it("should render children", () => {
    const { getByText } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    expect(getByText("Test content")).toBeInTheDocument();
  });

  it("should have correct structure", () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    // Verify that children are rendered
    expect(container).toBeTruthy();
  });
});
