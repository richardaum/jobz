import { buildProcessResumePrompt } from "@jobz/ai";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { copyToClipboard } from "@/shared/lib";

import { PromptModal } from "../prompt-modal";

// Mock dependencies
vi.mock("@jobz/ai", () => ({
  buildProcessResumePrompt: vi.fn((job, resume) => `Prompt for ${job} and ${resume}`),
}));

vi.mock("@/shared/lib", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/lib")>();
  return {
    ...actual,
    copyToClipboard: vi.fn(),
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("PromptModal", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render when open", () => {
    render(<PromptModal open={true} onOpenChange={mockOnOpenChange} resume="Resume" jobDescription="Job" />);

    expect(screen.getByText("Prompt Used")).toBeInTheDocument();
    expect(screen.getByText("The complete prompt sent to OpenAI for processing")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(<PromptModal open={false} onOpenChange={mockOnOpenChange} resume="Resume" jobDescription="Job" />);

    expect(screen.queryByText("Prompt Used")).not.toBeInTheDocument();
  });

  it("should build prompt from resume and job description", () => {
    render(<PromptModal open={true} onOpenChange={mockOnOpenChange} resume="My Resume" jobDescription="Job Desc" />);

    expect(buildProcessResumePrompt).toHaveBeenCalledWith("Job Desc", "My Resume");
  });

  it("should copy prompt to clipboard", async () => {
    const user = userEvent.setup();
    vi.mocked(copyToClipboard).mockResolvedValue(true);

    render(<PromptModal open={true} onOpenChange={mockOnOpenChange} resume="Resume" jobDescription="Job" />);

    const copyButton = screen.getByText("Copy Prompt");
    await user.click(copyButton);

    expect(copyToClipboard).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Prompt copied to clipboard!");
  });

  it("should show error when copy fails", async () => {
    const user = userEvent.setup();
    vi.mocked(copyToClipboard).mockResolvedValue(false);

    render(<PromptModal open={true} onOpenChange={mockOnOpenChange} resume="Resume" jobDescription="Job" />);

    const copyButton = screen.getByText("Copy Prompt");
    await user.click(copyButton);

    expect(toast.error).toHaveBeenCalledWith("Failed to copy prompt");
  });

  it("should disable copy button when prompt is empty", () => {
    render(<PromptModal open={true} onOpenChange={mockOnOpenChange} resume="" jobDescription="" />);

    const copyButton = screen.getByText("Copy Prompt");
    expect(copyButton).toBeDisabled();
  });
});
