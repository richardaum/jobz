import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Chatbot } from "../chatbot";
import type { ChatMessage } from "../types";

// Mock Button component
interface MockButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  [key: string]: unknown;
}

vi.mock("@/shared/ui", () => ({
  Button: ({ children, onClick, disabled, className, ...props }: MockButtonProps) => (
    <button onClick={onClick} disabled={disabled} className={className} data-testid="button" {...props}>
      {children}
    </button>
  ),
}));

describe("Chatbot", () => {
  const mockOnToggle = vi.fn();
  const mockOnSendMessage = vi.fn();
  const mockMessages: ChatMessage[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSendMessage.mockResolvedValue(undefined);
  });

  it("should not render when isOpen is false", () => {
    render(
      <Chatbot isOpen={false} onToggle={mockOnToggle} messages={mockMessages} onSendMessage={mockOnSendMessage} />
    );

    expect(screen.queryByText("Chat")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(<Chatbot isOpen={true} onToggle={mockOnToggle} messages={mockMessages} onSendMessage={mockOnSendMessage} />);

    expect(screen.getByText("Chat")).toBeInTheDocument();
    expect(screen.getAllByText("Start a conversation").length).toBeGreaterThan(0);
    expect(screen.getByText("Ask a question to get started")).toBeInTheDocument();
  });

  it("should render custom header config", () => {
    render(
      <Chatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        config={{
          header: {
            title: "Custom Chat",
            description: "Custom description",
          },
        }}
      />
    );

    expect(screen.getByText("Custom Chat")).toBeInTheDocument();
    expect(screen.getByText("Custom description")).toBeInTheDocument();
  });

  it("should render custom icon in header", () => {
    render(
      <Chatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        config={{
          header: {
            title: "Test",
            icon: <span data-testid="custom-icon">🎯</span>,
          },
        }}
      />
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should render empty state when no messages", () => {
    render(
      <Chatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={[]}
        onSendMessage={mockOnSendMessage}
        config={{
          emptyState: {
            title: "No messages yet",
            description: "Start chatting",
          },
        }}
      />
    );

    expect(screen.getByText("No messages yet")).toBeInTheDocument();
    expect(screen.getByText("Start chatting")).toBeInTheDocument();
  });

  it("should render user messages", () => {
    const messages: ChatMessage[] = [
      {
        id: "1",
        role: "user",
        content: "Hello!",
        timestamp: new Date(),
      },
    ];

    render(<Chatbot isOpen={true} onToggle={mockOnToggle} messages={messages} onSendMessage={mockOnSendMessage} />);

    expect(screen.getByText("Hello!")).toBeInTheDocument();
  });

  it("should render assistant messages", () => {
    const messages: ChatMessage[] = [
      {
        id: "1",
        role: "assistant",
        content: "Hi there!",
        timestamp: new Date(),
      },
    ];

    render(<Chatbot isOpen={true} onToggle={mockOnToggle} messages={messages} onSendMessage={mockOnSendMessage} />);

    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("should render multiple messages", () => {
    const messages: ChatMessage[] = [
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

    render(<Chatbot isOpen={true} onToggle={mockOnToggle} messages={messages} onSendMessage={mockOnSendMessage} />);

    expect(screen.getByText("Question 1")).toBeInTheDocument();
    expect(screen.getByText("Answer 1")).toBeInTheDocument();
    expect(screen.getByText("Question 2")).toBeInTheDocument();
  });

  it("should call onToggle when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<Chatbot isOpen={true} onToggle={mockOnToggle} messages={mockMessages} onSendMessage={mockOnSendMessage} />);

    const closeButton = screen.getAllByTestId("button")[0]; // First button is the close button
    await user.click(closeButton);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it("should call onSendMessage when send button is clicked", async () => {
    const user = userEvent.setup();
    render(<Chatbot isOpen={true} onToggle={mockOnToggle} messages={mockMessages} onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    await user.type(textarea, "Test message");

    const sendButton = screen.getByText("Send");
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith("Test message");
    });
  });

  it("should not send empty messages", async () => {
    const user = userEvent.setup();
    render(<Chatbot isOpen={true} onToggle={mockOnToggle} messages={mockMessages} onSendMessage={mockOnSendMessage} />);

    const sendButton = screen.getByText("Send");
    expect(sendButton).toBeDisabled();

    await user.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it("should send message on Enter key press", async () => {
    const user = userEvent.setup();
    render(<Chatbot isOpen={true} onToggle={mockOnToggle} messages={mockMessages} onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    await user.type(textarea, "Enter message{Enter}");

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith("Enter message");
    });
  });

  it("should not send message on Shift+Enter", async () => {
    const user = userEvent.setup();
    render(<Chatbot isOpen={true} onToggle={mockOnToggle} messages={mockMessages} onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    await user.type(textarea, "Multi{Shift>}{Enter}{/Shift}line");

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it("should disable input and send button when loading", () => {
    render(
      <Chatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        isLoading={true}
      />
    );

    const textarea = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByText("Send");

    expect(textarea).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it("should show loading indicator when isLoading is true", () => {
    const { container } = render(
      <Chatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        isLoading={true}
      />
    );

    // Loading indicator should be visible (three bouncing dots)
    // Look for the loading dots container
    const loadingDots = container.querySelectorAll(".animate-bounce");
    expect(loadingDots.length).toBeGreaterThan(0);
  });

  it("should apply custom placeholder", () => {
    render(
      <Chatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        config={{
          placeholder: "Type your question here...",
        }}
      />
    );

    expect(screen.getByPlaceholderText("Type your question here...")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Chatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        className="custom-chatbot-class"
      />
    );

    const chatbotElement = container.querySelector(".custom-chatbot-class");
    expect(chatbotElement).toBeInTheDocument();
  });

  it("should apply different position classes", () => {
    const { container, rerender } = render(
      <Chatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        config={{ position: "bottom-right" }}
      />
    );

    let chatbotElement = container.firstChild as HTMLElement;
    expect(chatbotElement.className).toContain("bottom-4");
    expect(chatbotElement.className).toContain("right-4");

    rerender(
      <Chatbot
        isOpen={true}
        onToggle={mockOnToggle}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        config={{ position: "top-left" }}
      />
    );

    chatbotElement = container.firstChild as HTMLElement;
    expect(chatbotElement.className).toContain("top-4");
    expect(chatbotElement.className).toContain("left-4");
  });

  it("should clear input after sending message", async () => {
    const user = userEvent.setup();
    render(<Chatbot isOpen={true} onToggle={mockOnToggle} messages={mockMessages} onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText("Type your message...") as HTMLTextAreaElement;
    await user.type(textarea, "Test message");

    const sendButton = screen.getByText("Send");
    await user.click(sendButton);

    await waitFor(() => {
      expect(textarea.value).toBe("");
    });
  });
});
