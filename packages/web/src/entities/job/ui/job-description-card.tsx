import { Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Textarea } from "@/shared/ui";

import type { MatchResult } from "@/entities/match-result";

import { ChecklistTooltip } from "@/entities/match-result/ui/checklist-tooltip";
import { JobMatchTooltip } from "@/entities/match-result/ui/job-match-tooltip";

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

