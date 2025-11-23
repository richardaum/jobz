interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "error";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = "default",
  showLabel = false,
  label,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getVariantColor = () => {
    if (variant === "success" || (variant === "default" && percentage >= 80)) return "bg-green-600";
    if (variant === "warning" || (variant === "default" && percentage >= 60)) return "bg-yellow-600";
    if (variant === "error" || (variant === "default" && percentage < 60)) return "bg-red-600";
    return "bg-blue-600";
  };

  const getTextColor = () => {
    if (variant === "success" || (variant === "default" && percentage >= 80)) return "text-green-600";
    if (variant === "warning" || (variant === "default" && percentage >= 60)) return "text-yellow-600";
    if (variant === "error" || (variant === "default" && percentage < 60)) return "text-red-600";
    return "text-blue-600";
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex items-center gap-2 mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}:</span>}
          <span className={`text-2xl font-bold ${getTextColor()}`}>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${getVariantColor()}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
