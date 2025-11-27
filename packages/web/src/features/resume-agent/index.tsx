"use client";

import { OpenAIClient } from "@jobz/ai";
import { useState } from "react";

import { useLocalStorage } from "@/shared/hooks/use-local-storage";
import { Button } from "@/shared/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { Label } from "@/shared/ui";
import { Textarea } from "@/shared/ui";

const STORAGE_KEYS = {
  resume: "resume-agent:resume",
  jobDescription: "resume-agent:job-description",
  adaptedResume: "resume-agent:adapted-resume",
  gaps: "resume-agent:gaps",
} as const;

export function ResumeAgent() {
  const [resume, setResume] = useLocalStorage(STORAGE_KEYS.resume, "");
  const [jobDescription, setJobDescription] = useLocalStorage(STORAGE_KEYS.jobDescription, "");
  const [adaptedResume, setAdaptedResume] = useLocalStorage(STORAGE_KEYS.adaptedResume, "");
  const [gaps, setGaps] = useLocalStorage(STORAGE_KEYS.gaps, "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      setError("Please fill in both resume and job description");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get API key from environment or user input
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
      if (!apiKey) {
        throw new Error("OpenAI API key not configured");
      }

      const client = new OpenAIClient(apiKey);

      // Process both in parallel
      const [adaptResult, gapsResult] = await Promise.all([
        client.adaptResume({
          resume,
          jobDescription,
        }),
        client.analyzeGaps({
          resume,
          jobDescription,
        }),
      ]);

      setAdaptedResume(adaptResult.adaptedResume);
      setGaps(gapsResult.gaps);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error processing resume:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
              <CardTitle>Job Description</CardTitle>
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
      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>}
    </div>
  );
}
