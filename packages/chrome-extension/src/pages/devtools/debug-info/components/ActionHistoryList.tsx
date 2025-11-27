import type { ActionItem } from "../hooks/useActionItems";
import { ActionHistoryItem } from "./ActionHistoryItem";

interface ActionHistoryListProps {
  actionItems: ActionItem[];
  expandedItems: Set<string>;
  onToggleItem: (id: string) => void;
}

export function ActionHistoryList({ actionItems, expandedItems, onToggleItem }: ActionHistoryListProps) {
  return (
    <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
      {actionItems.map((item) => (
        <ActionHistoryItem
          key={item.id}
          item={item}
          isExpanded={expandedItems.has(item.id)}
          onToggle={() => onToggleItem(item.id)}
        />
      ))}
    </div>
  );
}
