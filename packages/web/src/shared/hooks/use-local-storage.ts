import { useEffect, useState } from "react";

/**
 * Custom hook for 2-way localStorage binding
 * Handles both string and JSON-serializable values
 *
 * Note: Always starts with initialValue to prevent hydration mismatches.
 * The value from localStorage is loaded after hydration via useEffect.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Always start with initialValue to ensure server and client render match
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        // Try to parse as JSON, fallback to string if it fails
        try {
          setStoredValue(JSON.parse(item) as T);
        } catch {
          // If parsing fails, return as string (for plain text values)
          setStoredValue(item as T);
        }
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      // Only write to localStorage after hydration
      if (isHydrated && typeof window !== "undefined") {
        // Store as string if it's a string, otherwise JSON stringify
        if (typeof valueToStore === "string") {
          window.localStorage.setItem(key, valueToStore);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}
