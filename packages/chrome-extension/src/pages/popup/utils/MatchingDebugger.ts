import type { JobDescription } from "@/entities/job";
import type { Resume } from "@/entities/resume";
import type { DebugInfo } from "@/widgets/debug-panel";

export class MatchingDebugger {
  private steps: DebugInfo["steps"] = [];
  private info: DebugInfo;

  constructor(
    resume: Resume,
    private setDebugInfo: (info: DebugInfo) => void
  ) {
    this.info = {
      resume,
      steps: this.steps,
      startTime: Date.now(),
    };
    // Initial update
    this.update();
  }

  private update() {
    this.setDebugInfo({ ...this.info, steps: [...this.steps] });
  }

  addStep(step: string, status: "success" | "error" | "info", details?: string, duration?: number) {
    this.steps.push({
      step,
      timestamp: Date.now(),
      status,
      details,
      duration,
    });
    this.update();
  }

  setJob(job: JobDescription) {
    this.info.job = job;
    this.update();
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
