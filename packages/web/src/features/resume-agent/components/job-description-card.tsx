import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { Label } from "@/shared/ui";
import { Textarea } from "@/shared/ui";

import { ChecklistTooltip } from "./checklist-tooltip";
import { JobMatchTooltip } from "./job-match-tooltip";
import type { MatchResult } from "../stores/resume-store";

interface JobDescriptionCardProps {
  value: string;
  onChange: (value: string) => void;
  matchResult: MatchResult | null;
  isMatching: boolean;
  hasResume: boolean;
}

export function JobDescriptionCard({ value, onChange, matchResult, isMatching, hasResume }: JobDescriptionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Job Description</CardTitle>
          <JobMatchTooltip
            matchResult={matchResult}
            isMatching={isMatching}
            hasResume={hasResume}
            hasJobDescription={!!value.trim()}
          />
          {matchResult?.checklist && <ChecklistTooltip checklist={matchResult.checklist} />}
        </div>
        <CardDescription>Paste the job description here</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 flex-1 flex flex-col min-h-0">
          <Label htmlFor="job-description">Job Description</Label>
          <Textarea
            id="job-description"
            placeholder="Paste the job description here..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 min-h-0"
          />
        </div>
      </CardContent>
    </Card>
  );
}
