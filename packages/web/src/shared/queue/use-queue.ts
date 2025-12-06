import { useCallback, useRef } from "react";

/**
 * Generic queue hook for processing operations synchronously
 *
 * @template T - The type of data being processed
 * @param processor - Function that processes each queued operation
 * @returns Object with `enqueue` function to add operations to the queue
 *
 * @example
 * ```ts
 * const { enqueue } = useQueue((operation) => {
 *   // Process operation
 *   setState(operation);
 * });
 *
 * // Enqueue operations
 * enqueue({ type: 'update', data: newData });
 * ```
 */
export function useQueue<T>(processor: (operation: T) => void | Promise<void>): {
  enqueue: (operation: T) => void;
  clear: () => void;
  size: () => number;
} {
  const queueRef = useRef<T[]>([]);
  const isProcessingRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;

    // Process all queued operations sequentially
    while (queueRef.current.length > 0) {
      const operation = queueRef.current.shift()!;
      await processor(operation);
    }

    isProcessingRef.current = false;
  }, [processor]);

  const enqueue = useCallback(
    (operation: T) => {
      queueRef.current.push(operation);
      // Process immediately if not already processing
      // This avoids unnecessary delays while still allowing batching of rapid enqueues
      if (!isProcessingRef.current) {
        processQueue();
      }
    },
    [processQueue]
  );

  const clear = useCallback(() => {
    queueRef.current = [];
  }, []);

  const size = useCallback(() => {
    return queueRef.current.length;
  }, []);

  return { enqueue, clear, size };
}
