"use client";

import { MacScrollbar } from "mac-scrollbar";
import { useState } from "react";

import { parseContentWithChanges } from "../lib/parse-content-with-changes";
import type { ResumeChange, ResumeSection } from "../types";
import { ChangeInfo } from "./change-info";

interface AdaptedResumeViewerProps {
  content: string;
  changes: ResumeChange[];
  sections?: ResumeSection[];
  isLoading?: boolean;
}

export function AdaptedResumeViewer({ content, changes, sections, isLoading = false }: AdaptedResumeViewerProps) {
  const [hoveredChange, setHoveredChange] = useState<ResumeChange | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 border border-input rounded-md bg-muted/50">
        <p className="text-sm text-muted-foreground">Processing...</p>
      </div>
    );
  }

  if (!content.trim()) {
    return (
      <div className="flex items-center justify-center p-8 border border-input rounded-md bg-muted/50">
        <p className="text-sm text-muted-foreground">The adapted resume will appear here...</p>
      </div>
    );
  }

  // If sections are available, render them with subsections
  if (sections && sections.length > 0) {
    return (
      <MacScrollbar className="h-full w-full" skin="dark">
        <div className="p-4 space-y-4">
          {sections.map((section, sectionIndex) => {
            // Handle both new structure (with subsections) and old structure (with content)
            const subsections = section.subsections || [];
            const hasSubsections = subsections.length > 0;

            // If no subsections but has content (old structure), treat the whole section as one subsection
            // Type guard for backward compatibility with old structure
            const sectionWithContent = section as ResumeSection & { content?: string };
            const contentToRender = hasSubsections ? null : sectionWithContent.content || "";

            return (
              <div key={sectionIndex} className="space-y-3">
                {/* Section Title */}
                {section.name && (
                  <h3 className="text-lg font-semibold text-foreground mb-2 border-b border-border pb-1">
                    {section.name}
                  </h3>
                )}
                {hasSubsections ? (
                  subsections.map((subsection, subsectionIndex) => {
                    const subsectionSegments = parseContentWithChanges(subsection.content, changes);
                    // Only show subsection title if there are multiple subsections
                    const shouldShowSubsectionTitle = subsections.length > 1 && subsection.name;
                    return (
                      <div key={subsectionIndex} className="space-y-1">
                        {/* Subsection Title - only show if multiple subsections */}
                        {shouldShowSubsectionTitle && (
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">{subsection.name}</h4>
                        )}
                        <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed m-0">
                          {subsectionSegments.map((segment, index) => {
                            if (segment.isHighlighted && segment.change) {
                              return (
                                <ChangeInfo
                                  key={index}
                                  change={segment.change}
                                  onHoverChange={setHoveredChange}
                                  isHovered={hoveredChange === segment.change}
                                >
                                  <mark className="bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 cursor-pointer px-1.5 py-0.5 rounded transition-all duration-200 hover:bg-blue-200 dark:hover:bg-blue-950/60 hover:shadow-sm active:scale-[1.01] active:ring-2 active:ring-blue-300 dark:active:ring-blue-700 [box-decoration-break:clone]">
                                    {segment.text}
                                  </mark>
                                </ChangeInfo>
                              );
                            }
                            return <span key={index}>{segment.text}</span>;
                          })}
                        </pre>
                      </div>
                    );
                  })
                ) : contentToRender ? (
                  <div className="space-y-1">
                    <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed m-0">
                      {parseContentWithChanges(contentToRender, changes).map((segment, index) => {
                        if (segment.isHighlighted && segment.change) {
                          return (
                            <ChangeInfo
                              key={index}
                              change={segment.change}
                              onHoverChange={setHoveredChange}
                              isHovered={hoveredChange === segment.change}
                            >
                              <mark className="bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 cursor-pointer px-1 rounded transition-all duration-200 hover:bg-blue-200 dark:hover:bg-blue-950/60 hover:shadow-sm hover:scale-[1.02] hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-700">
                                {segment.text}
                              </mark>
                            </ChangeInfo>
                          );
                        }
                        return <span key={index}>{segment.text}</span>;
                      })}
                    </pre>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </MacScrollbar>
    );
  }

  // Fallback to original rendering if no sections
  const segments = parseContentWithChanges(content, changes);
  return (
    <MacScrollbar className="h-full w-full" skin="dark">
      <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed p-4 m-0">
        {segments.map((segment, index) => {
          if (segment.isHighlighted && segment.change) {
            return (
              <ChangeInfo
                key={index}
                change={segment.change}
                onHoverChange={setHoveredChange}
                isHovered={hoveredChange === segment.change}
              >
                <mark className="bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 cursor-pointer px-1 rounded transition-all duration-200 hover:bg-blue-200 dark:hover:bg-blue-950/60 hover:shadow-sm hover:scale-[1.02] hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-700">
                  {segment.text}
                </mark>
              </ChangeInfo>
            );
          }
          return <span key={index}>{segment.text}</span>;
        })}
      </pre>
    </MacScrollbar>
  );
}
