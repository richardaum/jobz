import { getUniqueSelector } from "@/shared/utils/dom-selector";

export class ElementPicker {
  private overlay: HTMLElement;
  private active: boolean = false;
  private onSelect: (selector: string, text: string) => void;

  constructor(onSelect: (selector: string, text: string) => void) {
    this.onSelect = onSelect;
    this.overlay = this.createOverlay();
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  private createOverlay(): HTMLElement {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.pointerEvents = "none";
    overlay.style.background = "rgba(59, 130, 246, 0.2)"; // Blue-500 with opacity
    overlay.style.border = "2px solid #3b82f6";
    overlay.style.zIndex = "999999";
    overlay.style.display = "none";
    overlay.style.transition = "all 0.1s ease";
    document.body.appendChild(overlay);
    return overlay;
  }

  public start() {
    if (this.active) return;
    this.active = true;
    document.addEventListener("mouseover", this.handleMouseOver, true);
    document.addEventListener("click", this.handleClick, true);
    document.addEventListener("keydown", this.handleKeyDown, true);
    document.body.style.cursor = "crosshair";
  }

  public stop() {
    if (!this.active) return;
    this.active = false;
    document.removeEventListener("mouseover", this.handleMouseOver, true);
    document.removeEventListener("click", this.handleClick, true);
    document.removeEventListener("keydown", this.handleKeyDown, true);
    this.overlay.style.display = "none";
    document.body.style.cursor = "default";
  }

  private handleMouseOver(event: MouseEvent) {
    if (!this.active) return;
    const target = event.target as HTMLElement;

    if (target === document.body || target === document.documentElement || target === this.overlay) {
      this.overlay.style.display = "none";
      return;
    }

    const rect = target.getBoundingClientRect();
    this.overlay.style.top = `${rect.top}px`;
    this.overlay.style.left = `${rect.left}px`;
    this.overlay.style.width = `${rect.width}px`;
    this.overlay.style.height = `${rect.height}px`;
    this.overlay.style.display = "block";
  }

  private handleClick(event: MouseEvent) {
    if (!this.active) return;
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    const selector = getUniqueSelector(target);
    const text = target.textContent?.trim() || "";

    this.onSelect(selector, text);
    this.stop();
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.active) return;
    if (event.key === "Escape") {
      this.stop();
    }
  }
}
