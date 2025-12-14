import { ref, onMounted, onUnmounted, type Ref, watch } from 'vue';

interface UseInfiniteScrollOptions {
  /** The root element to use for the observer (defaults to viewport) */
  root?: Ref<HTMLElement | null> | null
  /** Margin around the root (e.g., '200px') */
  rootMargin?: string
  /** Threshold for when the callback should be executed */
  threshold?: number
}

/**
 * Encapsulates the IntersectionObserver logic for infinite scrolling.
 *
 * @param sentinelRef - A ref to the element that triggers the load (the sentinel).
 * @param callback - The function to execute when the sentinel enters the viewport.
 * @param options - Observer configuration options.
 */
export function useInfiniteScroll(
  sentinelRef: Ref<HTMLElement | null>,
  callback: () => void,
  options: UseInfiniteScrollOptions = {},
) {
  const { root = null, rootMargin = '200px', threshold = 0.1 } = options;

  let observer: IntersectionObserver | null = null;

  const onIntersect: IntersectionObserverCallback = (entries) => {
    entries.forEach((entry) => {
      // The callback is only executed if the sentinel is currently intersecting
      if (entry.isIntersecting) {
        callback();
      }
    });
  };

  const setupObserver = () => {
    if (!sentinelRef.value || observer) return;

    // Ensure cleanup before setting up a new observer if root or options change
    // (though in this specific use case, root/options usually don't change)
    cleanupObserver();

    observer = new IntersectionObserver(onIntersect, {
      root: root?.value, // Use .value if root is a ref, otherwise it's null
      rootMargin,
      threshold,
    });

    observer.observe(sentinelRef.value);
  };

  const cleanupObserver = () => {
    if (observer && sentinelRef.value) {
      observer.unobserve(sentinelRef.value);
      observer.disconnect(); // Good practice to disconnect completely
      observer = null;
    }
  };

  // Setup observer when component mounts
  onMounted(() => {
    if (import.meta.client) {
      setupObserver();
    }
  });

  // Cleanup observer when component unmounts
  onUnmounted(cleanupObserver);

  // Watch the sentinel ref in case it changes dynamically (e.g., via v-if or list change)
  watch(sentinelRef, () => {
    if (import.meta.client) {
      setupObserver();
    }
  });

  return {
    setupObserver,
    cleanupObserver,
  };
}
