import { useEffect, useState, useCallback, useMemo } from "react";
import debounce from "lodash/debounce";

// Configurable thresholds for different scroll behaviors
const SCROLL_THRESHOLDS = {
  SHOW_BUTTON: 400, // Distance from bottom to show scroll button (px)
  AUTO_SCROLL: 200, // Distance from bottom to trigger auto-scroll (px)
  LOAD_MORE: 50, // Distance from top to trigger loading more messages (px)
} as const;

// Type definitions for scroll calculations
interface ScrollMetrics {
  distanceFromBottom: number;
  isAtTop: boolean;
}

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  count: number;
  // Optional configuration props
  thresholds?: Partial<typeof SCROLL_THRESHOLDS>;
  smoothScroll?: boolean;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  count,
  thresholds = {},
  smoothScroll = true,
}: ChatScrollProps) => {
  // State for tracking scroll behavior
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Memoize the scrollThresholds object to prevent recreation on every render
  const scrollThresholds = useMemo(
    () => ({
      ...SCROLL_THRESHOLDS,
      ...thresholds,
    }),
    [thresholds] // Only recreate when thresholds prop changes
  );

  // Memoize the scroll metrics calculation
  const getScrollMetrics = useCallback(
    (element: HTMLDivElement | null): ScrollMetrics => {
      if (!element) {
        return { distanceFromBottom: 0, isAtTop: false };
      }

      const scrollTop = Math.max(0, element.scrollTop);
      const distanceFromBottom = Math.max(
        0,
        element.scrollHeight - scrollTop - element.clientHeight
      );

      return {
        distanceFromBottom,
        isAtTop: scrollTop === 0,
      };
    },
    []
  ); // No dependencies since this is a pure calculation

  // Update the debounced scroll handler to use inline function
  const handleScroll = useCallback(
    debounce(() => {
      const topDiv = chatRef?.current;
      if (!topDiv) return;

      const { distanceFromBottom, isAtTop } = getScrollMetrics(topDiv);
      setShowScrollButton(distanceFromBottom > scrollThresholds.SHOW_BUTTON);

      if (isAtTop && shouldLoadMore) {
        loadMore();
      }

      setIsUserScrolling(distanceFromBottom > scrollThresholds.AUTO_SCROLL);
    }, 50),
    [chatRef, shouldLoadMore, loadMore, scrollThresholds, getScrollMetrics]
  );

  // Set up scroll event listener
  useEffect(() => {
    const topDiv = chatRef?.current;
    if (!topDiv) return;

    topDiv.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial scroll position

    return () => {
      handleScroll.cancel(); // Clean up debounced function
      topDiv.removeEventListener("scroll", handleScroll);
    };
  }, [chatRef, handleScroll]);

  // Handle auto-scrolling behavior
  useEffect(() => {
    const bottomDiv = bottomRef?.current;
    const topDiv = chatRef?.current;

    const shouldAutoScroll = () => {
      // Always scroll on first initialization
      if (!hasInitialized && bottomDiv) {
        setHasInitialized(true);
        return true;
      }

      if (!topDiv) return false;

      const { distanceFromBottom } = getScrollMetrics(topDiv);
      // Auto-scroll if near bottom or not manually scrolling
      return (
        distanceFromBottom <= scrollThresholds.AUTO_SCROLL || !isUserScrolling
      );
    };

    if (shouldAutoScroll()) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: smoothScroll ? "smooth" : "auto",
        });
        setShowScrollButton(false);
      });
    } else {
      handleScroll();
    }
  }, [
    bottomRef,
    chatRef,
    count,
    hasInitialized,
    isUserScrolling,
    scrollThresholds,
    smoothScroll,
    getScrollMetrics,
    handleScroll,
  ]);

  // Function to manually scroll to bottom
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: smoothScroll ? "smooth" : "auto",
      });
      setShowScrollButton(false);
      setIsUserScrolling(false);
    });
  }, [bottomRef, smoothScroll]);

  return {
    showScrollButton,
    scrollToBottom,
    isUserScrolling,
  };
};
