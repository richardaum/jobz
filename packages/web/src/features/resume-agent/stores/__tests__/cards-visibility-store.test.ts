import { beforeEach, describe, expect, it } from "vitest";

import { useCardsVisibilityStore } from "../cards-visibility-store";

describe("useCardsVisibilityStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useCardsVisibilityStore.setState({
      visibleCards: new Set(["adapted-resume", "gaps-analysis"]),
    });
  });

  it("should initialize with both cards visible", () => {
    const state = useCardsVisibilityStore.getState();
    expect(state.visibleCards.has("adapted-resume")).toBe(true);
    expect(state.visibleCards.has("gaps-analysis")).toBe(true);
  });

  it("should toggle card visibility", () => {
    const { toggleCard } = useCardsVisibilityStore.getState();

    // Hide a card
    toggleCard("adapted-resume");
    let state = useCardsVisibilityStore.getState();
    expect(state.visibleCards.has("adapted-resume")).toBe(false);
    expect(state.visibleCards.has("gaps-analysis")).toBe(true);

    // Show it again
    toggleCard("adapted-resume");
    state = useCardsVisibilityStore.getState();
    expect(state.visibleCards.has("adapted-resume")).toBe(true);
    expect(state.visibleCards.has("gaps-analysis")).toBe(true);
  });

  it("should show a specific card", () => {
    // First hide it
    useCardsVisibilityStore.getState().hideCard("adapted-resume");
    let state = useCardsVisibilityStore.getState();
    expect(state.visibleCards.has("adapted-resume")).toBe(false);

    // Then show it
    useCardsVisibilityStore.getState().showCard("adapted-resume");
    state = useCardsVisibilityStore.getState();
    expect(state.visibleCards.has("adapted-resume")).toBe(true);
  });

  it("should hide a specific card", () => {
    const { hideCard } = useCardsVisibilityStore.getState();

    hideCard("gaps-analysis");
    const state = useCardsVisibilityStore.getState();
    expect(state.visibleCards.has("gaps-analysis")).toBe(false);
    expect(state.visibleCards.has("adapted-resume")).toBe(true);
  });

  it("should show all cards", () => {
    // First hide all
    useCardsVisibilityStore.getState().hideAllCards();
    let state = useCardsVisibilityStore.getState();
    expect(state.visibleCards.size).toBe(0);

    // Then show all
    useCardsVisibilityStore.getState().showAllCards();
    state = useCardsVisibilityStore.getState();
    expect(state.visibleCards.has("adapted-resume")).toBe(true);
    expect(state.visibleCards.has("gaps-analysis")).toBe(true);
  });

  it("should hide all cards", () => {
    const { hideAllCards } = useCardsVisibilityStore.getState();

    hideAllCards();
    const state = useCardsVisibilityStore.getState();
    expect(state.visibleCards.size).toBe(0);
  });

  it("should handle toggling non-existent card (adds it)", () => {
    // Hide all first
    useCardsVisibilityStore.getState().hideAllCards();

    // Toggle a card that's not visible (should add it)
    useCardsVisibilityStore.getState().toggleCard("adapted-resume");
    const state = useCardsVisibilityStore.getState();
    expect(state.visibleCards.has("adapted-resume")).toBe(true);
    expect(state.visibleCards.has("gaps-analysis")).toBe(false);
  });

  it("should maintain separate state for each card", () => {
    const { toggleCard } = useCardsVisibilityStore.getState();

    toggleCard("adapted-resume");
    const state = useCardsVisibilityStore.getState();
    expect(state.visibleCards.has("adapted-resume")).toBe(false);
    expect(state.visibleCards.has("gaps-analysis")).toBe(true);
  });
});
