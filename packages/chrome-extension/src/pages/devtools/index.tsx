import { useState } from "react";

import { DebugInfo } from "./debug-info";
import { useLoggerIntegration } from "./hooks/useLoggerIntegration";
import { JobMatch } from "./job-match";
import { LearningMode } from "./learning-mode";

export function DevToolsPage() {
  const [activeTab, setActiveTab] = useState<"job-match" | "learning" | "debug">("job-match");
  
  // Integrate logger with store
  useLoggerIntegration();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex">
          <button
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "job-match"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("job-match")}
          >
            Job Match
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "learning"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("learning")}
          >
            Learning Mode
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "debug"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("debug")}
          >
            Debug Info
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "job-match" && <JobMatch />}
        {activeTab === "learning" && <LearningMode />}
        {activeTab === "debug" && <DebugInfo />}
      </div>
    </div>
  );
}
