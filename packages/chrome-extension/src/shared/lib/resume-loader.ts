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
  return new Promise((resolve) => {
    chrome.storage.local.get(["resume"], (result) => {
      if (result.resume) {
        resolve({
          content: result.resume,
          source: "manual",
        });
      } else {
        resolve(null);
      }
    });
  });
}

export async function saveResumeToStorage(resume: Resume): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ resume: resume.content }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

import resumeContent from "@/shared/assets/RICHARD_RESUME.md?raw";

export function loadResumeFromAssets(): Resume {
  return {
    content: resumeContent,
    source: "file",
  };
}
