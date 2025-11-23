interface DividerProps {
  className?: string;
  vertical?: boolean;
}

export function Divider({ className = "", vertical = false }: DividerProps) {
  if (vertical) {
    return <div className={`w-px bg-gray-300 ${className}`} />;
  }
  return <div className={`h-px bg-gray-300 ${className}`} />;
}
