/// <reference types="vite/client" />

declare module "*.md?raw" {
  const content: string;
  export default content;
}

interface ImportMeta {
  readonly hot?: {
    accept(callback?: (mod: any) => void): void;
    accept(dep: string, callback: (mod: any) => void): void;
    accept(deps: string[], callback: (mods: any[]) => void): void;
    dispose(callback: (data: any) => void): void;
    decline(): void;
    invalidate(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
    send(event: string, data?: any): void;
  };
}
