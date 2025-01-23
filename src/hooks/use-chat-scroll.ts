// import { useEffect, useState } from "react";

// type ChatScrollProps = {
//   chatRef: React.RefObject<HTMLDivElement | null>;
//   bottomRef: React.RefObject<HTMLDivElement | null>;
//   shouldLoadMore: boolean;
//   loadMore: () => void;
//   count: number;
// };

// export const useChatScroll = ({
//   chatRef,
//   bottomRef,
//   shouldLoadMore,
//   loadMore,
//   count,
// }: ChatScrollProps) => {
//   const [hasInitialized, setHasInitialized] = useState(false);
//   const [showScrollButton, setShowScrollButton] = useState(false);
//   const [isUserScrolling, setIsUserScrolling] = useState(false);

//   // Function to check scroll position and update button visibility
//   const handleScroll = () => {
//     const topDiv = chatRef?.current;

//     if (!topDiv) return;

//     const distanceFromBottom =
//       topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;

//     // Show scroll button if we're more than 400px from bottom
//     setShowScrollButton(distanceFromBottom > 400);

//     // Load more if we're at top
//     if (topDiv.scrollTop === 0 && shouldLoadMore) {
//       loadMore();
//     }

//     // Update user scrolling state
//     if (distanceFromBottom > 200) {
//       setIsUserScrolling(true);
//     } else {
//       setIsUserScrolling(false);
//     }
//   };

//   // Add scroll listener
//   useEffect(() => {
//     const topDiv = chatRef?.current;
//     if (topDiv) {
//       topDiv.addEventListener("scroll", handleScroll);
//       // Check initial scroll position
//       handleScroll();
//     }

//     return () => {
//       if (topDiv) {
//         topDiv.removeEventListener("scroll", handleScroll);
//       }
//     };
//   }, [chatRef, shouldLoadMore]);

//   // Auto-scroll logic
//   useEffect(() => {
//     const bottomDiv = bottomRef?.current;
//     const topDiv = chatRef?.current;

//     const shouldAutoScroll = () => {
//       // Always scroll on initialization
//       if (!hasInitialized && bottomDiv) {
//         setHasInitialized(true);
//         return true;
//       }

//       if (!topDiv) {
//         return false;
//       }

//       const distanceFromBottom =
//         topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;

//       // Auto-scroll if user is within 200px of bottom or not actively scrolling up
//       return distanceFromBottom <= 200 || !isUserScrolling;
//     };

//     if (shouldAutoScroll()) {
//       setTimeout(() => {
//         bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//         setShowScrollButton(false);
//       }, 100);
//     } else {
//       // Update button visibility
//       handleScroll();
//     }
//   }, [bottomRef, chatRef, count, hasInitialized, isUserScrolling]);

//   const scrollToBottom = () => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//     setShowScrollButton(false);
//     setIsUserScrolling(false);
//   };

//   return {
//     showScrollButton,
//     scrollToBottom,
//   };
// };
import { useEffect, useState, useCallback, useRef } from "react";
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

  // Merge default thresholds with any custom values
  const scrollThresholds = {
    ...SCROLL_THRESHOLDS,
    ...thresholds,
  };

  // Calculate current scroll position metrics
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
  );

  // Debounced scroll handler for performance
  const handleScroll = useCallback(
    debounce(() => {
      const topDiv = chatRef?.current;
      if (!topDiv) return;

      const { distanceFromBottom, isAtTop } = getScrollMetrics(topDiv);

      // Update scroll button visibility based on distance from bottom
      setShowScrollButton(distanceFromBottom > scrollThresholds.SHOW_BUTTON);

      // Trigger infinite scroll when at top
      if (isAtTop && shouldLoadMore) {
        loadMore();
      }

      // Update user scrolling state based on position
      setIsUserScrolling(distanceFromBottom > scrollThresholds.AUTO_SCROLL);
    }, 50), // 50ms debounce delay
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
