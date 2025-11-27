"use client";

import { useLocalStorage } from "@/shared/hooks/use-local-storage";
import { Button } from "@/shared/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { Label } from "@/shared/ui";
import { Textarea } from "@/shared/ui";

import { JobMatchTooltip } from "./components/job-match-tooltip";
import { useJobMatch } from "./hooks/use-job-match";
import { useProcessResume } from "./hooks/use-process-resume";

const STORAGE_KEYS = {
  resume: "resumeAgent:resume",
  jobDescription: "resumeAgent:jobDescription",
  adaptedResume: "resumeAgent:adaptedResume",
  gaps: "resumeAgent:gapsAnalysis",
} as const;

export function ResumeAgent() {
  const [resume, setResume] = useLocalStorage(STORAGE_KEYS.resume, "");
  const [jobDescription, setJobDescription] = useLocalStorage(STORAGE_KEYS.jobDescription, "");
  const [adaptedResume, setAdaptedResume] = useLocalStorage(STORAGE_KEYS.adaptedResume, "");
  const [gaps, setGaps] = useLocalStorage(STORAGE_KEYS.gaps, "");

  const { matchResult, isMatching } = useJobMatch({
    resume,
    jobDescription,
  });

  const processResumeMutation = useProcessResume();

  const handleProcess = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      return;
    }

    try {
      const result = await processResumeMutation.mutateAsync({
        resume,
        jobDescription,
      });

      setAdaptedResume(result.adaptedResume);
      setGaps(result.gaps);
    } catch (err) {
      // Error is handled by TanStack Query and displayed below
      console.error("Error processing resume:", err);
    }
  };

  const isLoading = processResumeMutation.isPending;
  const error = processResumeMutation.error;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* First Column */}
        <div className="space-y-6">
          {/* Resume Input */}
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
              <CardDescription>Paste your current resume here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="resume">Resume Content</Label>
                <Textarea
                  id="resume"
                  placeholder="Paste your resume here..."
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  className="min-h-[300px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Description Input */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Job Description</CardTitle>
                <JobMatchTooltip
                  matchResult={matchResult}
                  isMatching={isMatching}
                  hasResume={!!resume.trim()}
                  hasJobDescription={!!jobDescription.trim()}
                />
              </div>
              <CardDescription>Paste the job description here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description</Label>
                <Textarea
                  id="job-description"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[300px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Column */}
        <div className="space-y-6">
          {/* Adapted Resume Output */}
          <Card>
            <CardHeader>
              <CardTitle>Resume Adapted</CardTitle>
              <CardDescription>Your resume tailored for this job</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="adapted-resume">Adapted Resume</Label>
                <Textarea
                  id="adapted-resume"
                  readOnly
                  value={adaptedResume}
                  placeholder="The adapted resume will appear here..."
                  className="min-h-[300px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Gaps Analysis Output */}
          <Card>
            <CardHeader>
              <CardTitle>Gaps Analysis</CardTitle>
              <CardDescription>Understanding gaps from your perspective</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="gaps">Gaps Explanation</Label>
                <Textarea
                  id="gaps"
                  readOnly
                  value={gaps}
                  placeholder="Gap analysis will appear here..."
                  className="min-h-[300px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button onClick={handleProcess} disabled={isLoading} className="px-8 py-6 text-lg">
          {isLoading ? "Processing..." : "Process Resume"}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error instanceof Error ? error.message : "An error occurred"}
        </div>
      )}
    </div>
  );
}
