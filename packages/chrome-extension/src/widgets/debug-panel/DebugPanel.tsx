import { useState } from "react";

import type { DebugInfo } from "@/features/match-job";
import { Button, Card, Tabs } from "@/shared/ui";

import { ApiTab, JobTab, OverviewTab, ResumeTab, TimelineTab } from "./tabs";
export type { DebugInfo };

interface DebugPanelProps {
  debugInfo: DebugInfo;
  isOpen: boolean;
  onToggle: () => void;
}

export function DebugPanel({ debugInfo, isOpen, onToggle }: DebugPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "job" | "resume" | "api" | "timeline">("overview");

  if (!isOpen) {
    return (
      <div className="mt-4">
        <Button onClick={onToggle} variant="secondary" className="w-full text-xs">
          🔍 Show Debug Panel
        </Button>
      </div>
    );
  }

  const duration = debugInfo.endTime && debugInfo.startTime ? debugInfo.endTime - debugInfo.startTime : null;

  const tabs = [
    { id: "overview", label: "overview" },
    { id: "job", label: "job" },
    { id: "resume", label: "resume" },
    { id: "api", label: "api" },
    { id: "timeline", label: "timeline" },
  ];

  return (
    <Card
      className="mt-4"
      header={
        <>
          <h3 className="text-sm font-semibold">🐛 Debug Panel</h3>
          <Button onClick={onToggle} variant="secondary" className="text-xs px-2 py-1">
            Hide
          </Button>
        </>
      }
    >
      {/* Header Actions */}
      <div className="px-3 py-2 border-b border-gray-300 bg-white">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
          renderTabsOnly
        />
      </div>

      {/* Content */}
      <div className="p-3">
        {activeTab === "overview" && <OverviewTab debugInfo={debugInfo} duration={duration} />}
        {activeTab === "job" && <JobTab debugInfo={debugInfo} onJobExtracted={() => setActiveTab("job")} />}
        {activeTab === "resume" && <ResumeTab debugInfo={debugInfo} />}
        {activeTab === "api" && <ApiTab debugInfo={debugInfo} />}
        {activeTab === "timeline" && <TimelineTab debugInfo={debugInfo} />}
      </div>
    </Card>
  );
}
