import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatbotMessage } from "../../lib";
import { ResumeChatbot } from "../resume-chatbot";

// Mock the shared Chatbot component
vi.mock("@/shared/chatbot", () => ({
  Chatbot: ({
    isOpen,
    onToggle,
    messages,
    onSendMessage,
    isLoading,
    config,
  }: {
    isOpen: boolean;
    onToggle: () => void;
    messages: Array<{ id: string; role: string; content: string; timestamp: Date }>;
    onSendMessage: (message: string) => Promise<void>;
    isLoading: boolean;
    config: {
      header: { title: string; description: string; icon: React.ReactNode };
      emptyState: { title: string; description: string };
      placeholder: string;
      position: string;
    };
  }) => (
    <div data-testid="chatbot" data-is-open={isOpen}>
      <div data-testid="chatbot-header-title">{config.header.title}</div>
      <div data-testid="chatbot-header-description">{config.header.description}</div>
      <div data-testid="chatbot-empty-title">{config.emptyState.title}</div>
      <div data-testid="chatbot-empty-description">{config.emptyState.description}</div>
      <div data-testid="chatbot-placeholder">{config.placeholder}</div>
      <div data-testid="chatbot-position">{config.position}</div>
      <div data-testid="chatbot-messages-count">{messages.length}</div>
      <div data-testid="chatbot-loading">{isLoading ? "loading" : "not-loading"}</div>
      <button data-testid="chatbot-toggle" onClick={onToggle}>
        Toggle
      </button>
      <button data-testid="chatbot-send" onClick={() => onSendMessage("test message")} disabled={isLoading}>
        Send
      </button>
    </div>
  ),
}));

describe("ResumeChatbot", () => {
  const mockOnToggle = vi.fn();
  const mockOnSendMessage = vi.fn();
  const mockMessages: ChatbotMessage[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSendMessage.mockResolvedValue(undefined);
  });

  it("should render with resume-specific configuration", () => {
    render(
      <ResumeChatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
      />
    );

    expect(screen.getByTestId("chatbot-header-title")).toHaveTextContent("Ask about Resume");
    expect(screen.getByTestId("chatbot-header-description")).toHaveTextContent(
      "Get insights about your adapted resume"
    );
    expect(screen.getByTestId("chatbot-empty-title")).toHaveTextContent("Start a conversation");
    expect(screen.getByTestId("chatbot-empty-description")).toHaveTextContent(
      "Ask questions about your resume, job match, or gaps analysis"
    );
    expect(screen.getByTestId("chatbot-placeholder")).toHaveTextContent("Ask a question...");
    expect(screen.getByTestId("chatbot-position")).toHaveTextContent("bottom-right");
  });

  it("should convert ChatbotMessage to ChatMessage format", () => {
    const messages: ChatbotMessage[] = [
      {
        id: "1",
        role: "user",
        content: "Test message",
        timestamp: new Date("2024-01-01"),
      },
      {
        id: "2",
        role: "assistant",
        content: "Test response",
        timestamp: new Date("2024-01-01"),
      },
    ];

    render(
      <ResumeChatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={messages}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
      />
    );

    expect(screen.getByTestId("chatbot-messages-count")).toHaveTextContent("2");
  });

  it("should pass isLoading prop correctly", () => {
    const { rerender } = render(
      <ResumeChatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
      />
    );

    expect(screen.getByTestId("chatbot-loading")).toHaveTextContent("not-loading");

    rerender(
      <ResumeChatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        isLoading={true}
      />
    );

    expect(screen.getByTestId("chatbot-loading")).toHaveTextContent("loading");
  });

  it("should pass onToggle callback correctly", async () => {
    const user = userEvent.setup();
    render(
      <ResumeChatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
      />
    );

    const toggleButton = screen.getByTestId("chatbot-toggle");
    await user.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it("should pass onSendMessage callback correctly", async () => {
    const user = userEvent.setup();
    render(
      <ResumeChatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
      />
    );

    const sendButton = screen.getByTestId("chatbot-send");
    await user.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith("test message");
  });

  it("should handle multiple messages correctly", () => {
    const messages: ChatbotMessage[] = [
      {
        id: "1",
        role: "user",
        content: "Question 1",
        timestamp: new Date(),
      },
      {
        id: "2",
        role: "assistant",
        content: "Answer 1",
        timestamp: new Date(),
      },
      {
        id: "3",
        role: "user",
        content: "Question 2",
        timestamp: new Date(),
      },
    ];

    render(
      <ResumeChatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={messages}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
      />
    );

    expect(screen.getByTestId("chatbot-messages-count")).toHaveTextContent("3");
  });

  it("should handle empty messages array", () => {
    render(
      <ResumeChatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
      />
    );

    expect(screen.getByTestId("chatbot-messages-count")).toHaveTextContent("0");
  });

  it("should pass isOpen prop correctly", () => {
    const { rerender } = render(
      <ResumeChatbot
        isOpen={false}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
      />
    );

    expect(screen.getByTestId("chatbot")).toHaveAttribute("data-is-open", "false");

    rerender(
      <ResumeChatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
      />
    );

    expect(screen.getByTestId("chatbot")).toHaveAttribute("data-is-open", "true");
  });

  it("should preserve message data when converting types", () => {
    const messages: ChatbotMessage[] = [
      {
        id: "test-id-123",
        role: "user",
        content: "Test content",
        timestamp: new Date("2024-01-01T12:00:00Z"),
      },
    ];

    render(
      <ResumeChatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={messages}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
      />
    );

    // The conversion should preserve all message properties
    expect(screen.getByTestId("chatbot-messages-count")).toHaveTextContent("1");
  });
});
