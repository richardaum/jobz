import type { ResumeChange } from "../types";

export interface TextSegment {
  text: string;
  isHighlighted: boolean;
  change?: ResumeChange;
}

interface HighlightRange {
  start: number;
  end: number;
  change: ResumeChange;
}

/**
 * Parses the resume content and changes into segments with highlights
 * @param content - The full adapted resume content
 * @param changes - Array of changes made to the resume
 * @returns Array of text segments, where highlighted segments contain the change information
 */
export function parseContentWithChanges(content: string, changes: ResumeChange[]): TextSegment[] {
  if (!content || changes.length === 0) {
    return [{ text: content, isHighlighted: false }];
  }

  // Filter changes that have newText
  const validChanges = changes.filter((c) => c.newText && c.newText.trim());

  if (validChanges.length === 0) {
    return [{ text: content, isHighlighted: false }];
  }

  const highlights: HighlightRange[] = [];

  for (const change of validChanges) {
    const newText = change.newText;
    if (!newText) continue;

    // Try to find all occurrences of the newText in the content
    let searchIndex = 0;
    while (searchIndex < content.length) {
      const index = content.indexOf(newText, searchIndex);
      if (index === -1) break;

      // Check if this range overlaps with an existing highlight
      const overlaps = highlights.some((h) => !(index + newText.length <= h.start || index >= h.end));

      if (!overlaps) {
        highlights.push({
          start: index,
          end: index + newText.length,
          change,
        });
        break; // Only highlight the first non-overlapping occurrence
      }

      searchIndex = index + 1;
    }
  }

  // Sort highlights by start position
  highlights.sort((a, b) => a.start - b.start);

  // Build segments
  const segments: TextSegment[] = [];
  let currentIndex = 0;

  for (const highlight of highlights) {
    // Add text before the highlight
    if (highlight.start > currentIndex) {
      const beforeText = content.slice(currentIndex, highlight.start);
      if (beforeText) {
        segments.push({ text: beforeText, isHighlighted: false });
      }
    }

    // Add the highlighted text
    const highlightedText = content.slice(highlight.start, highlight.end);
    segments.push({
      text: highlightedText,
      isHighlighted: true,
      change: highlight.change,
    });

    currentIndex = highlight.end;
  }

  // Add remaining text
  if (currentIndex < content.length) {
    const remainingText = content.slice(currentIndex);
    if (remainingText) {
      segments.push({ text: remainingText, isHighlighted: false });
    }
  }

  // If no highlights were found, return the whole content as a single segment
  if (segments.length === 0) {
    return [{ text: content, isHighlighted: false }];
  }

  return segments;
}
