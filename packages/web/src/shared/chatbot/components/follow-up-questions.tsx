"use client";

interface FollowUpQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
  isLoading: boolean;
}

export function FollowUpQuestions({ questions, onQuestionClick, isLoading }: FollowUpQuestionsProps) {
  if (isLoading) {
    return null;
  }

  return (
    <div className="p-4 space-y-2">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onQuestionClick(question)}
          disabled={isLoading}
          className="w-full text-left px-3 py-2.5 text-sm rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground cursor-pointer"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
