/**
 * Resume History entity types
 * Represents historical records of resume adaptations
 */

import type { MatchResult } from "../match-result";
import type { ResumeChange } from "../resume";

export interface ResumeHistoryItem {
  /** Unique identifier for the history item */
  id: string;
  /** Timestamp when the history item was created */
  timestamp: number;
  /** Original resume content */
  resume: string;
  /** Job description used */
  jobDescription: string;
  /** Adapted resume content */
  adaptedResume: string;
  /** Gaps analysis text */
  gaps: string;
  /** Match result analysis */
  matchResult: MatchResult;
  /** Changes made to the resume */
  changes: ResumeChange[];
}

