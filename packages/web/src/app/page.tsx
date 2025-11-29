import { ResumeAgent } from "@/features/resume-agent";
import { AppBar } from "@/shared/components";

export default function Page() {
  return (
    <main className="h-screen bg-background flex flex-col overflow-hidden">
      <AppBar />
      <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4 sm:px-6 sm:pb-6 pt-4">
        <ResumeAgent />
      </div>
    </main>
  );
}
