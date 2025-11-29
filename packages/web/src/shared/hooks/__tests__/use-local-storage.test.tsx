import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLocalStorage } from "../use-local-storage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should initialize with initial value", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
    expect(result.current[0]).toBe("initial");
  });

  it("should load value from localStorage after hydration", async () => {
    localStorage.setItem("test-key", JSON.stringify("stored-value"));

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    // Wait for hydration - in test environment, hydration happens immediately
    await waitFor(
      () => {
        expect(result.current[0]).toBe("stored-value");
      },
      { timeout: 1000 }
    );
  });

  it("should save value to localStorage", async () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    // Wait a bit for hydration
    await new Promise((resolve) => setTimeout(resolve, 10));

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
    // localStorage stores strings - for string values, it stores as string, not JSON
    const stored = localStorage.getItem("test-key");
    expect(stored).toBeTruthy();
    // The hook stores strings directly, not as JSON
    expect(stored).toBe("new-value");
  });

  it("should handle string values without JSON parsing", async () => {
    localStorage.setItem("test-key", "plain-string");

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    await waitFor(() => {
      expect(result.current[0]).toBe("plain-string");
    });
  });

  it("should handle function updates", async () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 0));

    await waitFor(() => {
      expect(result.current[0]).toBe(0);
    });

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it("should handle complex objects", async () => {
    const initialValue = { name: "John", age: 30 };
    const { result } = renderHook(() => useLocalStorage("test-key", initialValue));

    await waitFor(() => {
      expect(result.current[0]).toEqual(initialValue);
    });

    act(() => {
      result.current[1]({ name: "Jane", age: 25 });
    });

    expect(result.current[0]).toEqual({ name: "Jane", age: 25 });
    expect(JSON.parse(localStorage.getItem("test-key")!)).toEqual({
      name: "Jane",
      age: 25,
    });
  });

  it("should handle errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock localStorage.setItem to throw an error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new Error("Storage quota exceeded");
    });

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    await waitFor(() => {
      expect(result.current[0]).toBe("initial");
    });

    act(() => {
      result.current[1]("new-value");
    });

    // Should still update the state even if localStorage fails
    expect(result.current[0]).toBe("new-value");

    localStorage.setItem = originalSetItem;
    consoleSpy.mockRestore();
  });
});
