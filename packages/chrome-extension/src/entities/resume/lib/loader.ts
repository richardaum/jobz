import { storage } from "@/shared/chrome-api";
import type { Resume } from "@/entities/resume";

export async function loadResumeFromFile(file: File): Promise<Resume> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve({
        content,
        source: "file",
      });
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function loadResumeFromUrl(url: string): Promise<Resume> {
  try {
    const response = await fetch(url);
    const content = await response.text();
    return {
      content,
      source: "url",
    };
  } catch (error) {
    throw new Error(`Failed to load resume from URL: ${error}`);
  }
}

export async function loadResumeFromStorage(): Promise<Resume | null> {
  const resumeContent = await storage.getItem<string>("resume");
  if (resumeContent) {
    return {
      content: resumeContent,
      source: "manual",
    };
  }
  return null;
}

export async function saveResumeToStorage(resume: Resume): Promise<void> {
  await storage.setItem("resume", resume.content);
}

import resumeContent from "@/shared/assets/RICHARD_RESUME.md?raw";

export function loadResumeFromAssets(): Resume {
  return {
    content: resumeContent,
    source: "file",
  };
}
