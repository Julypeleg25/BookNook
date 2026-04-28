import { useEffect, useMemo, useRef, useState } from "react";

interface UseInfiniteLoaderOptions<T> {
  items: T[];
  batchSize?: number;
  rootMargin?: string;
  resetKey?: string;
}

export const useInfiniteLoader = <T,>({
  items,
  batchSize = 20,
  rootMargin = "50px",
  resetKey,
}: UseInfiniteLoaderOptions<T>) => {
  const [state, setState] = useState(() => ({
    resetKey,
    visibleCount: batchSize,
  }));
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const visibleCount =
    state.resetKey === resetKey ? state.visibleCount : batchSize;
  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState((previousState) => {
            const baseCount =
              previousState.resetKey === resetKey
                ? previousState.visibleCount
                : batchSize;

            return {
              resetKey,
              visibleCount: Math.min(baseCount + batchSize, items.length),
            };
          });
        }
      },
      { rootMargin }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [items.length, batchSize, rootMargin]);

  return {
    visibleItems,
    loaderRef,
    hasMore: visibleCount < items.length,
    reset: () =>
      setState({
        resetKey,
        visibleCount: batchSize,
      }),
  };
};

export default useInfiniteLoader;
