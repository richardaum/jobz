"use client";

import { toast } from "sonner";

import { Button } from "@/shared/ui";

import { JobDescriptionCard } from "./components/job-description-card";
import { OutputCard } from "./components/output-card";
import { ResumeInputCard } from "./components/resume-input-card";
import { Toolbar } from "./components/toolbar";
import { useResumeProcessing } from "./hooks/use-resume-processing";
import { useResumeHistoryStore, useResumeStore } from "./stores/resume-store";
import { downloadResumeAsPDF } from "./utils/download-pdf";

export function ResumeAgent() {
  const resume = useResumeStore((state) => state.resume);
  const jobDescription = useResumeStore((state) => state.jobDescription);
  const setResume = useResumeStore((state) => state.setResume);
  const setJobDescription = useResumeStore((state) => state.setJobDescription);
  const adaptedResume = useResumeStore((state) => state.adaptedResume);
  const gaps = useResumeStore((state) => state.gaps);
  const matchResult = useResumeStore((state) => state.matchResult);
  const changes = useResumeStore((state) => state.changes);
  const updateOutputs = useResumeStore((state) => state.updateOutputs);
  const addToHistory = useResumeHistoryStore((state) => state.addToHistory);

  const processing = useResumeProcessing({
    onSuccess: (data) => {
      updateOutputs(data);
      // Save to history (separate storage)
      addToHistory({
        resume,
        jobDescription,
        adaptedResume: data.adaptedResume,
        gaps: data.gaps,
        matchResult: data.matchResult,
      });
    },
  });

  const handleProcess = () => {
    processing.process(resume, jobDescription);
  };

  // Prioritize stored matchResult from store, then current processing result
  const currentMatchResult = matchResult ?? processing.currentMatchResult;

  const handleDownloadPDF = () => {
    downloadResumeAsPDF(adaptedResume, "adapted-resume.pdf");
  };

  const handleCopyGaps = async () => {
    try {
      await navigator.clipboard.writeText(gaps);
      toast.success("Gaps analysis copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Toolbar />
      <div className="grid grid-cols-2 gap-6">
        {/* First Column */}
        <div className="space-y-6">
          <ResumeInputCard value={resume} onChange={setResume} />
          <JobDescriptionCard
            value={jobDescription}
            onChange={setJobDescription}
            matchResult={currentMatchResult}
            isMatching={processing.isMatching}
            hasResume={!!resume.trim()}
          />
        </div>

        {/* Second Column */}
        <div className="space-y-6">
          <OutputCard
            title="Adapted Resume"
            description="Your resume tailored for this job"
            value={adaptedResume}
            placeholder="The adapted resume will appear here..."
            id="adapted-resume"
            isLoading={processing.isLoading}
            onDownload={handleDownloadPDF}
            showDownload={true}
            changes={changes}
          />
          <OutputCard
            title="Gaps Analysis"
            description="Understanding gaps from your perspective"
            value={gaps}
            placeholder="Gap analysis will appear here..."
            id="gaps"
            isLoading={processing.isLoading}
            onCopy={handleCopyGaps}
            showCopy={true}
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
