import { useCallback, useEffect, useRef, useState } from "react";

export interface StreamState {
  isStreaming: boolean;
  accumulatedContent: string;
  chunkCount: number;
}

export interface UseStreamOptions {
  onChunk?: (chunk: string, state: StreamState) => void;
  onStart?: () => void;
  onComplete?: (finalContent: string, chunkCount: number) => void;
  onError?: (error: Error) => void;
  logEvery?: number; // Log every N chunks (default: 20, set to 0 to disable)
}

/**
 * Generic hook for managing streaming operations
 *
 * @param options - Configuration options for the stream
 * @returns Object with stream state and control functions
 *
 * @example
 * ```ts
 * const { stream, isStreaming, accumulatedContent, reset } = useStream({
 *   onChunk: (chunk, state) => {
 *     console.log(`Received chunk ${state.chunkCount}: ${chunk}`);
 *   },
 *   onComplete: (content, count) => {
 *     console.log(`Stream complete: ${count} chunks, ${content.length} chars`);
 *   }
 * });
 *
 * // Start streaming with a function
 * await stream(async (onChunk) => {
 *   await fetchStream(onChunk);
 * });
 * ```
 */
export function useStream(options: UseStreamOptions = {}): {
  stream: <T = void>(streamFunction: (onChunk: (chunk: string) => void) => Promise<T>) => Promise<T>;
  isStreaming: boolean;
  accumulatedContent: string;
  chunkCount: number;
  reset: () => void;
} {
  const { onChunk, onStart, onComplete, onError, logEvery = 20 } = options;

  const [isStreaming, setIsStreaming] = useState(false);
  const [accumulatedContent, setAccumulatedContent] = useState("");
  const [chunkCount, setChunkCount] = useState(0);

  const accumulatedContentRef = useRef("");
  const chunkCountRef = useRef(0);

  // Use refs for callbacks to allow dynamic updates
  const onChunkRef = useRef(onChunk);
  const onStartRef = useRef(onStart);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onChunkRef.current = onChunk;
    onStartRef.current = onStart;
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onChunk, onStart, onComplete, onError]);

  const reset = useCallback(() => {
    setAccumulatedContent("");
    setChunkCount(0);
    accumulatedContentRef.current = "";
    chunkCountRef.current = 0;
  }, []);

  const stream = useCallback(
    async <T = void>(streamFunction: (onChunk: (chunk: string) => void) => Promise<T>): Promise<T> => {
      setIsStreaming(true);
      reset();
      onStartRef.current?.();

      try {
        const result = await streamFunction((chunk: string) => {
          chunkCountRef.current++;
          accumulatedContentRef.current += chunk;

          setChunkCount(chunkCountRef.current);
          setAccumulatedContent(accumulatedContentRef.current);

          const currentState: StreamState = {
            isStreaming: true,
            accumulatedContent: accumulatedContentRef.current,
            chunkCount: chunkCountRef.current,
          };

          // Call custom onChunk handler if provided (using ref for latest callback)
          onChunkRef.current?.(chunk, currentState);

          // Log periodically if logEvery is set
          if (logEvery > 0 && chunkCountRef.current % logEvery === 0) {
            console.log(
              `[Stream] Chunk ${chunkCountRef.current}, content length: ${accumulatedContentRef.current.length}`
            );
          }
        });

        onCompleteRef.current?.(accumulatedContentRef.current, chunkCountRef.current);
        return result;
      } catch (error) {
        const streamError = error instanceof Error ? error : new Error(String(error));
        onErrorRef.current?.(streamError);
        throw streamError;
      } finally {
        setIsStreaming(false);
      }
    },
    [logEvery, reset]
  );

  return {
    stream,
    isStreaming,
    accumulatedContent,
    chunkCount,
    reset,
  };
}
