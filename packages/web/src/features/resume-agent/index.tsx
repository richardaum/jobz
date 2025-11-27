"use client";

import { Button } from "@/shared/ui";

import { JobDescriptionCard } from "./components/job-description-card";
import { OutputCard } from "./components/output-card";
import { ResumeInputCard } from "./components/resume-input-card";
import { useResumeInputs } from "./hooks/use-resume-inputs";
import { useResumeOutputs } from "./hooks/use-resume-outputs";
import { useResumeProcessing } from "./hooks/use-resume-processing";

export function ResumeAgent() {
  const inputs = useResumeInputs();
  const outputs = useResumeOutputs();
  const processing = useResumeProcessing({
    onSuccess: outputs.updateOutputs,
  });

  const handleProcess = () => {
    processing.process(inputs.resume, inputs.jobDescription);
  };

  // Prioritize stored matchResult from localStorage, then current processing result
  const matchResult = outputs.matchResult ?? processing.currentMatchResult;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* First Column */}
        <div className="space-y-6">
          <ResumeInputCard value={inputs.resume} onChange={inputs.setResume} />
          <JobDescriptionCard
            value={inputs.jobDescription}
            onChange={inputs.setJobDescription}
            matchResult={matchResult}
            isMatching={processing.isMatching}
            hasResume={!!inputs.resume.trim()}
          />
        </div>

        {/* Second Column */}
        <div className="space-y-6">
          <OutputCard
            title="Resume Adapted"
            description="Your resume tailored for this job"
            value={outputs.adaptedResume}
            placeholder="The adapted resume will appear here..."
            id="adapted-resume"
          />
          <OutputCard
            title="Gaps Analysis"
            description="Understanding gaps from your perspective"
            value={outputs.gaps}
            placeholder="Gap analysis will appear here..."
            id="gaps"
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button onClick={handleProcess} disabled={processing.isLoading} className="px-8 py-6 text-lg">
          {processing.isLoading ? "Processing..." : "Process Resume"}
        </Button>
      </div>
    </div>
  );
}
