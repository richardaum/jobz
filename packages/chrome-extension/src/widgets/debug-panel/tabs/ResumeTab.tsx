import { CodeBlock } from "@/shared/ui";

import type { DebugInfo } from "../DebugPanel";

interface ResumeTabProps {
  debugInfo: DebugInfo;
}

export function ResumeTab({ debugInfo }: ResumeTabProps) {
  if (!debugInfo.resume) {
    return <div className="text-center py-8 text-gray-500 text-xs">No resume loaded yet.</div>;
  }

  return (
    <div className="space-y-2 text-xs">
      <div>
        <span className="font-semibold">Source:</span> {debugInfo.resume.source}
      </div>
      <div>
        <span className="font-semibold">Length:</span> {debugInfo.resume.content.length} chars
      </div>
      <div className="mt-2">
        <span className="font-semibold">Content Preview:</span>
        <CodeBlock className="mt-1" maxHeight="max-h-40">
          {debugInfo.resume.content.substring(0, 500)}...
        </CodeBlock>
      </div>
    </div>
  );
}
