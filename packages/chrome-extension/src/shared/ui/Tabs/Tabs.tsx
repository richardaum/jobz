import { useState } from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string; // Controlled mode
  onTabChange?: (tabId: string) => void;
  children?: (activeTab: string) => React.ReactNode;
  className?: string;
  renderTabsOnly?: boolean; // If true, only render tabs without content
}

export function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  children,
  className = "",
  renderTabsOnly = false,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id || "");
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabChange = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  return (
    <div className={className}>
      <div className="flex border-b-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-3 py-1 text-xs font-medium capitalize whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id
                ? "bg-blue-100 text-blue-800 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {!renderTabsOnly && children && <div>{children(activeTab)}</div>}
    </div>
  );
}
