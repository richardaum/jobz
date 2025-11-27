"use client";

import { OpenAIClient, type ProcessResumeRequest, type ProcessResumeResponse } from "@jobz/ai";
import { useMutation } from "@tanstack/react-query";

import { getOpenAIApiKey } from "@/shared/config/storage";

export class ApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiKeyError";
  }
}

async function processResume(request: ProcessResumeRequest): Promise<ProcessResumeResponse> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new ApiKeyError("OpenAI API key not configured. Please set it in Settings.");
  }

  const client = new OpenAIClient(apiKey);
  return client.processResume(request);
}

export function useResumeAgent() {
  return useMutation({
    mutationFn: processResume,
    retry: 1,
  });
}
