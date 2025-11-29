import { create } from "zustand";

type CardId = "adapted-resume" | "gaps-analysis";

interface CardsVisibilityState {
  visibleCards: Set<CardId>;
  toggleCard: (cardId: CardId) => void;
  showCard: (cardId: CardId) => void;
  hideCard: (cardId: CardId) => void;
  showAllCards: () => void;
  hideAllCards: () => void;
}

export const useCardsVisibilityStore = create<CardsVisibilityState>((set) => ({
  visibleCards: new Set<CardId>(["adapted-resume", "gaps-analysis"]),
  toggleCard: (cardId) =>
    set((state) => {
      const newSet = new Set(state.visibleCards);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return { visibleCards: newSet };
    }),
  showCard: (cardId) =>
    set((state) => {
      const newSet = new Set(state.visibleCards);
      newSet.add(cardId);
      return { visibleCards: newSet };
    }),
  hideCard: (cardId) =>
    set((state) => {
      const newSet = new Set(state.visibleCards);
      newSet.delete(cardId);
      return { visibleCards: newSet };
    }),
  showAllCards: () => set({ visibleCards: new Set<CardId>(["adapted-resume", "gaps-analysis"]) }),
  hideAllCards: () => set({ visibleCards: new Set<CardId>() }),
}));
