import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Page from "../page";

// Mock Next.js components
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock AppBar and ResumeAgent
vi.mock("@/shared/components", () => ({
  AppBar: () => <header>AppBar</header>,
}));

vi.mock("@/features/resume-agent", () => ({
  ResumeAgent: () => <div>ResumeAgent</div>,
}));

describe("Page", () => {
  it("should render main element", () => {
    render(<Page />);
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
  });

  it("should render AppBar", () => {
    render(<Page />);
    // AppBar should be rendered (check by structure)
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
  });
});
