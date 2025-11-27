import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  openaiApiKey: string;
  setOpenAIApiKey: (apiKey: string) => void;
  getOpenAIApiKey: () => string | null;
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
    }),
    {
      name: "settings-storage",
      partialize: (state) => ({
        openaiApiKey: state.openaiApiKey,
      }),
    }
  )
);
