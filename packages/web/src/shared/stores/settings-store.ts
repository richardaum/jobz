import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingsStore {
  openaiApiKey: string;
  setOpenAIApiKey: (apiKey: string) => void;
  getOpenAIApiKey: () => string | null;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      openaiApiKey: "",

      setOpenAIApiKey: (apiKey: string) => set({ openaiApiKey: apiKey.trim() }),

      getOpenAIApiKey: () => {
        const state = get();
        return state.openaiApiKey || null;
      },

      isSettingsOpen: false,
      setIsSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),
    }),
    {
      name: "settings-storage",
      partialize: (state) => ({
        openaiApiKey: state.openaiApiKey,
        // Don't persist UI state
      }),
    }
  )
);
