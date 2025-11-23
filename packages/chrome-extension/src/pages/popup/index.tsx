import { ErrorDisplay } from "./components/ErrorDisplay";
import { MatchButton } from "./components/MatchButton";
import { PopupHeader } from "./components/PopupHeader";
import { ResultSection } from "./components/ResultSection";

export function PopupPage() {
  return (
    <div className="w-96 p-4">
      <PopupHeader />

      <div className="space-y-4">
        <MatchButton />
        <ErrorDisplay />
        <ResultSection />
      </div>
    </div>
  );
}
