import { useEffect, useRef, useState } from "react";

interface UseInfiniteLoaderOptions<T> {
  items: T[];
  batchSize?: number;
  rootMargin?: string;
}

export const useInfiniteLoader = <T,>({
  items,
  batchSize = 20,
  rootMargin = "50px",
}: UseInfiniteLoaderOptions<T>) => {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((v) => Math.min(v + batchSize, items.length));
        }
      },
      { rootMargin }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [items.length, batchSize, rootMargin]);

  return {
    visibleItems: items.slice(0, visibleCount),
    loaderRef,
    hasMore: visibleCount < items.length,
    reset: () => setVisibleCount(batchSize),
  };
};

export default useInfiniteLoader;