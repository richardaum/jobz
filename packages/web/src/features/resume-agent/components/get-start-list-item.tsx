import { ComponentType,ReactNode } from "react";

interface GetStartListItemProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  completedTitle: string;
  description: ReactNode;
  completedDescription: ReactNode;
  isCompleted: boolean;
  isPrimary?: boolean;
}

export function GetStartListItem({
  icon: Icon,
  title,
  completedTitle,
  description,
  completedDescription,
  isCompleted,
  isPrimary = false,
}: GetStartListItemProps) {
  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-lg border ${
        isCompleted
          ? isPrimary
            ? "bg-primary/10 border-primary/20"
            : "bg-muted/50 opacity-60"
          : "bg-muted/50"
      }`}
    >
      <div className="shrink-0 mt-1">
        <Icon
          className={`h-6 w-6 ${
            isCompleted
              ? isPrimary
                ? "text-primary"
                : "text-muted-foreground opacity-60"
              : "text-muted-foreground"
          }`}
        />
      </div>
      <div className="flex-1">
        <h3
          className={`font-semibold mb-1 ${
            isCompleted
              ? isPrimary
                ? "text-primary"
                : "line-through opacity-60"
              : ""
          }`}
        >
          {isCompleted ? completedTitle : title}
        </h3>
        <p className={`text-sm text-muted-foreground ${isCompleted && !isPrimary ? "opacity-60" : ""}`}>
          {isCompleted ? completedDescription : description}
        </p>
      </div>
    </div>
  );
}

