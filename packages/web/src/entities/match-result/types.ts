/**
 * Match Result entity types
 * Represents the analysis of matching a resume to a job
 */

export interface ChecklistItem {
  /** Category of the checklist item */
  category: string;
  /** Whether the item is checked (requirement met) */
  checked: boolean;
  /** Description of the checklist item */
  description: string;
}

export interface MatchResult {
  /** Match percentage (0-100) */
  matchPercentage: number;
  /** Analysis text describing the match */
  analysis: string;
  /** Checklist of requirements and their status */
  checklist: ChecklistItem[];
}

