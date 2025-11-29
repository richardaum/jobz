/**
 * Resume entity types
 * Represents a resume document and its content
 */

export interface Resume {
  /** The resume content as text */
  content: string;
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
}

