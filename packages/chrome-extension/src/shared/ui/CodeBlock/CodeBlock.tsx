import type React from "react";

interface CodeBlockProps {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  children,
  maxHeight = "max-h-96",
  className = "",
  showLineNumbers = false,
}: CodeBlockProps) {
  const hasMaxHeight = maxHeight && maxHeight.trim() !== "";
  const overflowClass = hasMaxHeight ? "overflow-y-auto" : "";

  return (
    <div className={`p-2 bg-white border border-gray-200 rounded ${maxHeight} ${overflowClass} ${className}`}>
      <pre className={`whitespace-pre-wrap text-xs ${showLineNumbers ? "font-mono" : ""}`}>{children}</pre>
    </div>
  );
}
