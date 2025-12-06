import { describe, expect, it } from "vitest";

import type { ResumeChange } from "../../types";
import { parseContentWithChanges } from "../parse-content-with-changes";

describe("parseContentWithChanges", () => {
  it("should return single segment when content is empty", () => {
    const result = parseContentWithChanges("", []);
    expect(result).toEqual([{ text: "", isHighlighted: false }]);
  });

  it("should return single segment when changes array is empty", () => {
    const result = parseContentWithChanges("Some content", []);
    expect(result).toEqual([{ text: "Some content", isHighlighted: false }]);
  });

  it("should return single segment when no valid changes", () => {
    const changes: ResumeChange[] = [
      { section: "Test", description: "Test change", newText: "" },
      { section: "Test", description: "Test change", newText: "   " },
    ];
    const result = parseContentWithChanges("Some content", changes);
    expect(result).toEqual([{ text: "Some content", isHighlighted: false }]);
  });

  it("should highlight single change", () => {
    const content = "This is a test resume with some content";
    const changes: ResumeChange[] = [
      {
        section: "Test Section",
        description: "Changed text",
        newText: "test resume",
        originalText: "resume",
        reason: "To emphasize",
      },
    ];

    const result = parseContentWithChanges(content, changes);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ text: "This is a ", isHighlighted: false });
    expect(result[1]).toEqual({
      text: "test resume",
      isHighlighted: true,
      change: changes[0],
    });
    expect(result[2]).toEqual({ text: " with some content", isHighlighted: false });
  });

  it("should highlight multiple non-overlapping changes", () => {
    const content = "Start changed1 middle changed2 end";
    const changes: ResumeChange[] = [
      {
        section: "Section 1",
        description: "First change",
        newText: "changed1",
        originalText: "old1",
      },
      {
        section: "Section 2",
        description: "Second change",
        newText: "changed2",
        originalText: "old2",
      },
    ];

    const result = parseContentWithChanges(content, changes);

    expect(result.length).toBeGreaterThan(1);
    const highlightedSegments = result.filter((s) => s.isHighlighted);
    expect(highlightedSegments).toHaveLength(2);
    expect(highlightedSegments[0].text).toBe("changed1");
    expect(highlightedSegments[1].text).toBe("changed2");
  });

  it("should handle overlapping changes by highlighting first non-overlapping occurrence", () => {
    const content = "This is test test text";
    const changes: ResumeChange[] = [
      {
        section: "Section 1",
        description: "First change",
        newText: "test",
        originalText: "old",
      },
    ];

    const result = parseContentWithChanges(content, changes);

    const highlightedSegments = result.filter((s) => s.isHighlighted);
    // Should only highlight the first occurrence
    expect(highlightedSegments.length).toBeGreaterThanOrEqual(1);
    expect(highlightedSegments[0].text).toBe("test");
  });

  it("should handle changes at the beginning of content", () => {
    const content = "Changed text at start";
    const changes: ResumeChange[] = [
      {
        section: "Section",
        description: "Change at start",
        newText: "Changed",
        originalText: "Old",
      },
    ];

    const result = parseContentWithChanges(content, changes);

    expect(result[0]).toEqual({
      text: "Changed",
      isHighlighted: true,
      change: changes[0],
    });
    expect(result[1]).toEqual({ text: " text at start", isHighlighted: false });
  });

  it("should handle changes at the end of content", () => {
    const content = "Start with changed";
    const changes: ResumeChange[] = [
      {
        section: "Section",
        description: "Change at end",
        newText: "changed",
        originalText: "old",
      },
    ];

    const result = parseContentWithChanges(content, changes);

    expect(result[result.length - 1]).toEqual({
      text: "changed",
      isHighlighted: true,
      change: changes[0],
    });
  });

  it("should handle changes that are not found in content", () => {
    const content = "Some content";
    const changes: ResumeChange[] = [
      {
        section: "Section",
        description: "Change not found",
        newText: "not found text",
        originalText: "old",
      },
    ];

    const result = parseContentWithChanges(content, changes);

    // Should return content without highlights
    expect(result).toEqual([{ text: "Some content", isHighlighted: false }]);
  });

  it("should preserve order of highlights by position", () => {
    const content = "First Second Third";
    const changes: ResumeChange[] = [
      {
        section: "Section 3",
        description: "Third change",
        newText: "Third",
        originalText: "old3",
      },
      {
        section: "Section 1",
        description: "First change",
        newText: "First",
        originalText: "old1",
      },
      {
        section: "Section 2",
        description: "Second change",
        newText: "Second",
        originalText: "old2",
      },
    ];

    const result = parseContentWithChanges(content, changes);

    const highlightedSegments = result.filter((s) => s.isHighlighted);
    expect(highlightedSegments).toHaveLength(3);
    // Should be in document order, not array order
    expect(highlightedSegments[0].text).toBe("First");
    expect(highlightedSegments[1].text).toBe("Second");
    expect(highlightedSegments[2].text).toBe("Third");
  });

  it("should handle changes with special characters", () => {
    const content = "Text with - dashes and (parentheses)";
    const changes: ResumeChange[] = [
      {
        section: "Section",
        description: "Change with special chars",
        newText: "- dashes",
        originalText: "old",
      },
    ];

    const result = parseContentWithChanges(content, changes);

    const highlightedSegments = result.filter((s) => s.isHighlighted);
    expect(highlightedSegments).toHaveLength(1);
    expect(highlightedSegments[0].text).toBe("- dashes");
  });

  it("should handle multiline content", () => {
    const content = "Line 1\nLine 2\nLine 3";
    const changes: ResumeChange[] = [
      {
        section: "Section",
        description: "Multiline change",
        newText: "Line 2",
        originalText: "old",
      },
    ];

    const result = parseContentWithChanges(content, changes);

    const highlightedSegments = result.filter((s) => s.isHighlighted);
    expect(highlightedSegments).toHaveLength(1);
    expect(highlightedSegments[0].text).toBe("Line 2");
  });
});
