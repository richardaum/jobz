"use client";

import { MacScrollbar } from "mac-scrollbar";
import { useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { useAutoScroll } from "../hooks";
import type { ChatbotEmptyState, ChatMessage } from "../types";

interface ChatbotMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  emptyState?: ChatbotEmptyState;
  onScrollToBottom?: () => void;
}

export function ChatbotMessages({ messages, isLoading, emptyState, onScrollToBottom }: ChatbotMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Handle auto-scrolling with respect to user scroll position
  useAutoScroll({
    messagesEndRef,
    enabled: true,
    onScrollToBottom,
    dependencies: [messages],
  });

  // Filter out empty assistant messages when loading (hide them until stream starts writing)
  const visibleMessages = messages.filter((message) => {
    // Hide empty assistant messages while loading (before stream starts writing)
    if (isLoading && message.role === "assistant" && !message.content.trim()) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 min-h-0">
      <MacScrollbar className="h-full w-full" skin="dark">
        <div className="p-4 space-y-4">
          {visibleMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px] text-center">
              <div className="text-muted-foreground">
                <p className="text-sm font-medium mb-1">{emptyState?.title || "Start a conversation"}</p>
                {emptyState?.description && <p className="text-xs">{emptyState.description}</p>}
              </div>
            </div>
          ) : (
            visibleMessages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <div className="text-sm prose prose-invert prose-sm max-w-none dark:prose-invert chatbot-markdown">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="mb-2 ml-4 list-disc last:mb-0">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal last:mb-0">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        code: ({ className, children, ...props }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code
                              className="bg-black/20 dark:bg-white/10 px-1 py-0.5 rounded text-xs font-mono"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre className="bg-black/30 dark:bg-black/50 rounded p-2 mb-2 overflow-x-auto last:mb-0">
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-current/30 pl-3 my-2 italic">{children}</blockquote>
                        ),
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-2 first:mt-0">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-2 first:mt-0">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-2 mt-2 first:mt-0">{children}</h3>,
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            className="underline hover:no-underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-2">
                            <table className="min-w-full border-collapse border border-current/20">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-black/20">{children}</thead>,
                        tbody: ({ children }) => <tbody>{children}</tbody>,
                        tr: ({ children }) => <tr className="border-b border-current/20">{children}</tr>,
                        th: ({ children }) => (
                          <th className="border border-current/20 px-2 py-1 text-left">{children}</th>
                        ),
                        td: ({ children }) => <td className="border border-current/20 px-2 py-1">{children}</td>,
                        hr: () => <hr className="my-2 border-current/20" />,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </MacScrollbar>
    </div>
  );
}
