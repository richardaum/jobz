/**
 * Resume entity types
 * Represents a resume document and its content
 */

export interface Resume {
  /** The resume content as text */
  content: string;
}

export interface ResumeSubsection {
  /** The name of the subsection (e.g., "Company Name", "Job Title", "Skill Category") */
  name: string;
  /** The content of this subsection */
  content: string;
}

export interface ResumeSection {
  /** The name of the section (e.g., "Summary", "Experience", "Skills") */
  name: string;
  /** Subsections within this section */
  subsections: ResumeSubsection[];
}

export interface AdaptedResume {
  /** The adapted resume content */
  content: string;
  /** Changes made to adapt the resume */
  changes: ResumeChange[];
}

export interface ResumeChange {
  /** The section of the resume that was changed */
  section: string;
  /** Description of the change */
  description: string;
  /** The original text before the change */
  originalText?: string;
  /** The new text after the change */
  newText?: string;
  /** The reason why this change was made */
  reason?: string;
  /** Position/context in the document (e.g., line number or section identifier) */
  position?: string;
}
