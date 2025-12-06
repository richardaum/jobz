"use client";

import { IconPercentage } from "@tabler/icons-react";

import { Button, Tooltip } from "@/shared/ui";

import type { MatchResult } from "../types";

interface JobMatchButtonProps {
  matchResult: MatchResult | null;
  isMatching: boolean;
  hasResume: boolean;
  hasJobDescription: boolean;
}

function getMatchColorClasses(percentage: number): string {
  if (percentage >= 80) {
    // Excellent match - Green (light for dark background)
    return "border-green-500 text-green-400 font-semibold hover:bg-green-950/20 hover:border-green-400";
  } else if (percentage >= 60) {
    // Good match - Amber/Yellow (light for dark background)
    return "border-amber-500 text-amber-400 font-semibold hover:bg-amber-950/20 hover:border-amber-400";
  } else if (percentage >= 40) {
    // Medium match - Orange (light for dark background)
    return "border-orange-500 text-orange-400 font-semibold hover:bg-orange-950/20 hover:border-orange-400";
  } else {
    // Low match - Red (light for dark background)
    return "border-red-500 text-red-400 font-semibold hover:bg-red-950/20 hover:border-red-400";
  }
}

function getIconColorClasses(percentage: number): string {
  if (percentage >= 80) {
    return "text-green-400";
  } else if (percentage >= 60) {
    return "text-amber-400";
  } else if (percentage >= 40) {
    return "text-orange-400";
  } else {
    return "text-red-400";
  }
}

export function JobMatchButton({ matchResult, isMatching, hasResume, hasJobDescription }: JobMatchButtonProps) {
  const hasData = hasResume && hasJobDescription;
  const isDisabled = !hasData || (!matchResult && !isMatching);

  const matchPercentage = matchResult?.matchPercentage ?? 0;
  const buttonColorClasses = matchResult ? getMatchColorClasses(matchPercentage) : "";
  const iconColorClasses = matchResult ? getIconColorClasses(matchPercentage) : "";

  return (
    <Tooltip
      side="bottom"
      className="max-w-sm"
      content={
        isDisabled ? (
          <p className="text-sm">
            {!hasData
              ? "Fill in both resume and job description, then process to see match analysis"
              : "Click 'Process Resume' to see match analysis"}
          </p>
        ) : isMatching ? (
          <p className="text-sm">Matching job with your resume...</p>
        ) : matchResult ? (
          <div className="space-y-2">
            <div className="font-semibold text-sm">Match: {matchResult.matchPercentage}%</div>
            <div className="text-sm text-muted-foreground leading-relaxed">{matchResult.analysis}</div>
          </div>
        ) : null
      }
    >
      <Button
        variant="hoverable"
        size="sm"
        type="button"
        disabled={isDisabled}
        className={`group gap-2 ${buttonColorClasses}`}
      >
        <IconPercentage
          className={`h-4 w-4 ${
            isMatching
              ? "animate-pulse text-muted-foreground"
              : matchResult
                ? iconColorClasses
                : "text-muted-foreground"
          }`}
        />
        {isMatching ? "Matching..." : matchResult ? `Match: ${matchResult.matchPercentage}%` : "Job Match"}
      </Button>
    </Tooltip>
  );
}
