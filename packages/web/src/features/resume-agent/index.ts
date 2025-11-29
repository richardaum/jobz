// Main component
export { ResumeAgent } from "./resume-agent";

// Components
export { HistoryModal } from "./components/history-modal";
export { OutputCard } from "./components/output-card";
export { PromptModal } from "./components/prompt-modal";
export { Toolbar } from "./components/toolbar";

// Re-export entity components for backward compatibility
export { JobDescriptionCard, JobDescriptionPopover } from "@/entities/job";
export { ChecklistButton, ChecklistTooltip, JobMatchButton, JobMatchTooltip } from "@/entities/match-result";
export { AdaptedResumeButton, ResumeChangesTooltip, ResumeInputCard, ResumePopover } from "@/entities/resume";
export { HistoryTab } from "@/entities/resume-history";

// Hooks
export { useResumeAgent } from "./hooks/resume-agent";
export { useResumeHistory } from "./hooks/use-resume-history";
export { useResumeInputs } from "./hooks/use-resume-inputs";
export { useResumeOutputs } from "./hooks/use-resume-outputs";
export { useResumeProcessing } from "./hooks/use-resume-processing";

// Stores
export { useResumeHistoryStore, useResumeStore } from "./stores/resume-store";

// Utils
export { downloadResumeAsPDF } from "./utils/download-pdf";
export { formatForPDF } from "./utils/format-pdf";
export { sanitizeForPDF } from "./utils/sanitize-pdf";

// Types (re-exported from entities via store for backward compatibility)
export type { ChecklistItem, MatchResult, ResumeChange, ResumeHistoryItem } from "./stores/resume-store";
