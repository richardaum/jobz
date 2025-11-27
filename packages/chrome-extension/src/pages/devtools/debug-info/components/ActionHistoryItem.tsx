import { IconCheck, IconChevronDown, IconChevronRight, IconInfoCircle, IconLoader, IconX } from "@tabler/icons-react";

import type { JobDescription } from "@/entities/job";
import type { Resume } from "@/entities/resume";
import { CodeBlock } from "@/shared/ui";

import type { ActionItem } from "../hooks/useActionItems";

interface ActionHistoryItemProps {
  item: ActionItem;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ActionHistoryItem({ item, isExpanded, onToggle }: ActionHistoryItemProps) {
  const statusColors = {
    success: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  const statusIcons = {
    success: <IconCheck className="w-3 h-3" />,
    error: <IconX className="w-3 h-3" />,
    info: <IconInfoCircle className="w-3 h-3" />,
    processing: <IconLoader className="w-3 h-3 animate-spin" />,
  };

  const renderDetails = () => {
    if (!isExpanded || !item.data) return null;

    switch (item.type) {
      case "summary": {
        const summary = item.data as {
          startTime?: number;
          endTime?: number;
          duration?: number | null;
          error?: { message: string };
        };
        return (
          <div className="pt-3 space-y-2 text-sm border-t border-gray-200">
            {summary.startTime && (
              <div>
                <span className="font-semibold">Started:</span> {new Date(summary.startTime).toLocaleString()}
              </div>
            )}
            {summary.endTime && (
              <div>
                <span className="font-semibold">Completed:</span> {new Date(summary.endTime).toLocaleString()}
              </div>
            )}
            {summary.duration !== null && summary.duration !== undefined && (
              <div>
                <span className="font-semibold">Duration:</span> {summary.duration.toFixed(0)}ms
              </div>
            )}
            {summary.error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800">
                <span className="font-semibold">Error:</span> {summary.error.message}
              </div>
            )}
          </div>
        );
      }

      case "job": {
        const job = item.data as JobDescription;
        return (
          <div className="pt-3 space-y-3 text-sm border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-semibold">Source:</span> {job.source}
              </div>
              <div>
                <span className="font-semibold">Title:</span> {job.title}
              </div>
              <div>
                <span className="font-semibold">Company:</span> {job.company}
              </div>
              <div>
                <span className="font-semibold">Description Length:</span> {job.description.length} chars
              </div>
            </div>
            {job.url && (
              <div>
                <span className="font-semibold">URL:</span>{" "}
                <span className="text-blue-600 break-all text-xs">{job.url}</span>
              </div>
            )}
            {job.extractionMetadata && (
              <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                <div className="font-semibold mb-1">Extraction Metadata:</div>
                <div className="text-xs space-y-1">
                  <div>
                    Selector: <code className="bg-white px-1 rounded">{job.extractionMetadata.usedSelector}</code>
                  </div>
                  {job.extractionMetadata.isCollection && <div>Type: Collection page</div>}
                  {job.extractionMetadata.failedSelectors && job.extractionMetadata.failedSelectors.length > 0 && (
                    <div>
                      <div className="font-semibold text-red-600">Failed Selectors:</div>
                      <div className="max-h-20 overflow-y-auto">
                        {job.extractionMetadata.failedSelectors.map((selector, idx) => (
                          <div key={idx} className="text-red-500 font-mono text-xs break-all">
                            - {selector}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div>
              <span className="font-semibold">Full Description:</span>
              <CodeBlock className="mt-2" maxHeight="max-h-64">
                {job.description || "No description available"}
              </CodeBlock>
            </div>
          </div>
        );
      }

      case "resume": {
        const resume = item.data as Resume;
        return (
          <div className="pt-3 space-y-2 text-sm border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-semibold">Source:</span> {resume.source}
              </div>
              <div>
                <span className="font-semibold">Length:</span> {resume.content.length} chars
              </div>
            </div>
            <div>
              <span className="font-semibold">Content Preview:</span>
              <CodeBlock className="mt-2" maxHeight="max-h-40">
                {resume.content.substring(0, 500)}...
              </CodeBlock>
            </div>
          </div>
        );
      }

      case "api": {
        const api = item.data as { request?: unknown; response?: unknown };
        const request = api.request as
          | { model?: string; promptLength?: number; resumeLength?: number; jobDescriptionLength?: number }
          | undefined;
        const response = api.response as
          | { matchPercentage?: number; analysis?: string; rawResponse?: unknown }
          | undefined;
        return (
          <div className="pt-3 space-y-3 text-sm border-t border-gray-200">
            {request && (
              <div>
                <span className="font-semibold">Request:</span>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                  <div>Model: {request.model}</div>
                  <div>Job Description: {request.jobDescriptionLength} chars</div>
                  <div>Resume: {request.resumeLength} chars</div>
                  <div>Total Prompt: {request.promptLength} chars</div>
                </div>
              </div>
            )}
            {response && (
              <div>
                <span className="font-semibold">Response:</span>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded text-xs space-y-2">
                  {response.matchPercentage !== undefined && (
                    <div>
                      <span className="font-semibold">Match:</span> {response.matchPercentage}%
                    </div>
                  )}
                  {response.analysis && (
                    <div>
                      <span className="font-semibold">Analysis:</span>
                      <div className="mt-1 p-2 bg-white rounded max-h-32 overflow-y-auto">{response.analysis}</div>
                    </div>
                  )}
                  {response.rawResponse !== undefined && (
                    <div>
                      <span className="font-semibold">Raw Response:</span>
                      <CodeBlock className="mt-1" maxHeight="max-h-32">
                        {String(
                          typeof response.rawResponse === "string"
                            ? response.rawResponse
                            : JSON.stringify(response.rawResponse, null, 2)
                        )}
                      </CodeBlock>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }

      case "log": {
        const logs = item.data as Array<{
          level: "log" | "warn" | "error" | "info" | "debug";
          message: string;
          timestamp: number;
          args?: unknown[];
        }>;
        const levelColors = {
          debug: "bg-gray-100 text-gray-700 border-gray-300",
          log: "bg-gray-100 text-gray-700 border-gray-300",
          info: "bg-blue-100 text-blue-700 border-blue-300",
          warn: "bg-yellow-100 text-yellow-700 border-yellow-300",
          error: "bg-red-100 text-red-700 border-red-300",
        };
        return (
          <div className="pt-3 space-y-2 text-sm border-t border-gray-200 max-h-[60vh] overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 py-1 border-b border-gray-100 last:border-0">
                <span className={`px-2 py-0.5 rounded text-xs font-mono flex-shrink-0 ${levelColors[log.level]}`}>
                  {log.level.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs break-words">{log.message}</div>
                  {log.args && log.args.length > 0 && (
                    <div className="mt-1 p-2 bg-gray-50 rounded text-xs max-h-32 overflow-y-auto">
                      <pre className="whitespace-pre-wrap break-words">
                        {log.args.map((arg, idx) => {
                          if (typeof arg === "string") {
                            return <div key={idx}>{arg}</div>;
                          }
                          try {
                            return <div key={idx}>{JSON.stringify(arg, null, 2)}</div>;
                          } catch {
                            return <div key={idx}>{String(arg)}</div>;
                          }
                        })}
                      </pre>
                    </div>
                  )}
                  <div className="text-gray-400 text-xs mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 text-gray-600">{item.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">{item.title}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {new Date(item.timestamp).toLocaleTimeString()}
              {item.duration !== undefined && ` • ${item.duration.toFixed(0)}ms`}
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium border flex-shrink-0 flex items-center gap-1 ${statusColors[item.status]}`}
          >
            {statusIcons[item.status]}
            <span>{item.status}</span>
          </span>
        </div>
        <div className="ml-2 flex-shrink-0">
          {isExpanded ? (
            <IconChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <IconChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>
      {isExpanded && <div className="px-4 pb-3 bg-gray-50">{renderDetails()}</div>}
    </div>
  );
}
