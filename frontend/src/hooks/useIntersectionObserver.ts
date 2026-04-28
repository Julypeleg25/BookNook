import { useEffect, useCallback, RefObject } from "react";

interface UseIntersectionObserverProps {
  targetRef: RefObject<HTMLElement | null>;
  onIntersect: () => void;
  enabled?: boolean;
  threshold?: number;
  rootMargin?: string;
  resetKey?: string;
}

export const useIntersectionObserver = ({
  targetRef,
  onIntersect,
  enabled = true,
  threshold = 0.1,
  rootMargin = "0px",
  resetKey,
}: UseIntersectionObserverProps) => {
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && enabled) {
        onIntersect();
      }
    },
    [onIntersect, enabled]
  );

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver, targetRef, threshold, rootMargin, resetKey]);
};
