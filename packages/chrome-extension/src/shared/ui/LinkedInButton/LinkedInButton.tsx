import React from "react";

interface LinkedInButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function LinkedInButton({
  children,
  onClick,
  disabled = false,
  variant = "secondary",
  className = "",
  style = {},
  onMouseEnter,
  onMouseLeave,
}: LinkedInButtonProps) {
  const baseClasses = "artdeco-button artdeco-button--3";
  const variantClass = variant === "primary" ? "artdeco-button--primary" : "artdeco-button--secondary";
  const buttonClass = variant === "secondary" ? "jobs-save-button" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClass} ${buttonClass} ${className}`}
      style={{
        marginLeft: "8px",
        cursor: disabled ? "wait" : "pointer",
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="artdeco-button__text">{children}</span>
    </button>
  );
}
