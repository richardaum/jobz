import type React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ children, className = "", header, footer }: CardProps) {
  return (
    <div className={`border border-gray-300 rounded-lg bg-gray-50 ${className}`}>
      {header && <div className="flex items-center justify-between p-2 bg-gray-200 rounded-t-lg">{header}</div>}
      <div className={header || footer ? "p-3" : "p-3"}>{children}</div>
      {footer && <div className="p-2 bg-gray-200 rounded-b-lg border-t border-gray-300">{footer}</div>}
    </div>
  );
}
