import axios, { AxiosInstance } from "axios";

import { adaptResume as adaptResumeFunction } from "../functions/adapt-resume";
import { analyzeGaps as analyzeGapsFunction } from "../functions/analyze-gaps";
import { matchJob as matchJobFunction } from "../functions/match-job";
import { processResume as processResumeFunction } from "../functions/resume-agent";
import type {
  AdaptResumeRequest,
  AdaptResumeResponse,
  AnalyzeGapsRequest,
  AnalyzeGapsResponse,
  MatchJobRequest,
  MatchJobResponse,
  ProcessResumeRequest,
  ProcessResumeResponse,
} from "../types";

export class OpenAIClient {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: "https://api.openai.com/v1",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  async matchJob(request: MatchJobRequest): Promise<MatchJobResponse> {
    return matchJobFunction(this.client, request);
  }

  async adaptResume(request: AdaptResumeRequest): Promise<AdaptResumeResponse> {
    return adaptResumeFunction(this.client, request);
  }

  async analyzeGaps(request: AnalyzeGapsRequest): Promise<AnalyzeGapsResponse> {
    return analyzeGapsFunction(this.client, request);
  }

  async processResume(request: ProcessResumeRequest): Promise<ProcessResumeResponse> {
    return processResumeFunction(this.client, request);
  }
}
