import { vi } from "vitest";

vi.mock("mac-scrollbar", () => {
  return {
    MacScrollbar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    GlobalScrollbar: () => null,
  };
});
