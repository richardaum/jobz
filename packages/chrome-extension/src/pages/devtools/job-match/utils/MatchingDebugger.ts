import type { JobDescription } from "@/entities/job";
import type { Resume } from "@/entities/resume";
import { useMatchingStore } from "@/features/match-job";
import type { DebugInfo } from "@/widgets/debug-panel";

export class MatchingDebugger {
  private info: DebugInfo;

  constructor(resume: Resume) {
    this.info = {
      resume,
      logs: [],
      startTime: Date.now(),
    };
    // Initial update
    this.update();
  }

  private update() {
    const { setDebugInfo } = useMatchingStore.getState();
    setDebugInfo((prev) => ({
      ...this.info,
      logs: prev.logs || this.info.logs || [],
    }));
  }

  setJob(job: JobDescription) {
    const { setJob } = useMatchingStore.getState();
    setJob(job);
  }

  setApiRequest(request: NonNullable<DebugInfo["apiRequest"]>) {
    this.info.apiRequest = request;
    this.update();
  }

  setApiResponse(response: NonNullable<DebugInfo["apiResponse"]>) {
    this.info.apiResponse = response;
    this.update();
  }

  setError(error: Error) {
    this.info.error = {
      message: error.message,
      stack: error.stack,
    };
    this.info.endTime = Date.now();
    this.update();
  }

  complete() {
    this.info.endTime = Date.now();
    this.update();
  }

  getStartTime(): number {
    return this.info.startTime || 0;
  }
}
