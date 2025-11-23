import { useEffect, useRef, useState } from "react";

const HMR_COUNTER_KEY = "__hmr_counter__";
const LAST_LOAD_TIME_KEY = "__last_load_time__";

function getHMRCount(): number {
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem(HMR_COUNTER_KEY);
    return stored ? parseInt(stored, 10) : 0;
  }
  return 0;
}

function incrementHMRCount(): number {
  if (typeof window !== "undefined") {
    const current = getHMRCount();
    const next = current + 1;
    sessionStorage.setItem(HMR_COUNTER_KEY, next.toString());
    sessionStorage.setItem(LAST_LOAD_TIME_KEY, Date.now().toString());
    return next;
  }
  return 0;
}

function isNewLoad(): boolean {
  if (typeof window === "undefined") return false;

  const lastLoadTime = sessionStorage.getItem(LAST_LOAD_TIME_KEY);
  const now = Date.now();

  // If no last load time, this is the first load
  if (!lastLoadTime) {
    return true;
  }

  // If more than 100ms passed since last load, consider it a new load
  // (this handles page reloads, not just HMR)
  const timeSinceLastLoad = now - parseInt(lastLoadTime, 10);
  return timeSinceLastLoad > 100;
}

export function useHMRCounter() {
  const [hmrCount, setHmrCount] = useState(() => {
    const count = getHMRCount();
    // Increment on mount if this is a new load
    if (isNewLoad()) {
      const newCount = incrementHMRCount();
      return newCount;
    }
    return count;
  });

  const hasIncremented = useRef(false);

  useEffect(() => {
    // Increment on mount if we haven't already
    if (!hasIncremented.current && isNewLoad()) {
      const newCount = incrementHMRCount();
      setHmrCount(newCount);
      hasIncremented.current = true;
      console.log(`[HMR] Extension reloaded #${newCount}`);
    }

    // Also try to listen to HMR if available (for dev mode)
    if (import.meta.hot) {
      import.meta.hot.accept(() => {
        const newCount = incrementHMRCount();
        setHmrCount(newCount);
        console.log(`[HMR] Hot reload #${newCount}`);
      });
    }
  }, []);

  return hmrCount;
}
