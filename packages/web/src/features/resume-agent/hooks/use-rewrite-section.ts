"use client";

import { OpenAIClient, type RewriteSectionRequest, type RewriteSectionResponse } from "@jobz/ai";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getOpenAIApiKey } from "@/shared/config/storage";
import { useSettingsStore } from "@/shared/stores";

import { ApiKeyError } from "./resume-agent";

async function rewriteSection(request: RewriteSectionRequest): Promise<RewriteSectionResponse> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new ApiKeyError("OpenAI API key not configured. Please set it in Settings.");
  }

  const client = new OpenAIClient(apiKey);
  return client.rewriteSection(request);
}

export function useRewriteSection() {
  const setIsSettingsOpen = useSettingsStore((state) => state.setIsSettingsOpen);

  return useMutation({
    mutationFn: rewriteSection,
    retry: 1,
    onError: (error) => {
      if (error instanceof ApiKeyError) {
        toast.error(error.message, {
          action: {
            label: "Open Settings",
            onClick: () => setIsSettingsOpen(true),
          },
        });
      } else {
        toast.error("Failed to rewrite section. Please try again.");
      }
    },
  });
}
