import type { ResumeContext } from "./types";

const CHATBOT_SYSTEM_MESSAGE = `You are a helpful assistant that answers questions about a candidate's resume adaptation process. 
You have access to:
- The original resume
- The job description
- The adapted resume
- The gaps analysis
- The job match results
- The changes made to the resume

Answer questions clearly and concisely, focusing on helping the candidate understand:
- What changes were made to their resume and why
- How well their resume matches the job
- What gaps exist and how to address them
- Specific sections or content in their resume

Be conversational and helpful. If asked about something not in the context, politely say you don't have that information.`;

/**
 * Builds the context string from resume data for the chatbot
 */
export function buildChatbotContext(context: ResumeContext): string {
  const contextParts: string[] = [];

  if (context.resume.trim()) {
    contextParts.push(`ORIGINAL RESUME:\n${context.resume}`);
  }

  if (context.jobDescription.trim()) {
    contextParts.push(`JOB DESCRIPTION:\n${context.jobDescription}`);
  }

  if (context.adaptedResume.trim()) {
    contextParts.push(`ADAPTED RESUME:\n${context.adaptedResume}`);
  }

  if (context.gaps.trim()) {
    contextParts.push(`GAPS ANALYSIS:\n${context.gaps}`);
  }

  if (context.matchResult) {
    contextParts.push(
      `JOB MATCH RESULTS:\nMatch Percentage: ${context.matchResult.matchPercentage}%\nAnalysis: ${context.matchResult.analysis}\nChecklist: ${JSON.stringify(context.matchResult.checklist, null, 2)}`
    );
  }

  if (context.changes.length > 0) {
    contextParts.push(`CHANGES MADE:\n${JSON.stringify(context.changes, null, 2)}`);
  }

  if (context.sections.length > 0) {
    // Convert sections with subsections to a simpler format for context
    const sectionsForContext = context.sections.map((section) => ({
      name: section.name,
      content: section.subsections.map((sub) => `${sub.name}: ${sub.content}`).join("\n"),
    }));
    contextParts.push(`RESUME SECTIONS:\n${JSON.stringify(sectionsForContext, null, 2)}`);
  }

  return contextParts.join("\n\n---\n\n");
}

/**
 * Gets the system message for the chatbot
 */
export function getChatbotSystemMessage(): string {
  return CHATBOT_SYSTEM_MESSAGE;
}
