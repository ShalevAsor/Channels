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

//   // Function to check scroll position and update button visibility
//   const handleScroll = () => {
//     const topDiv = chatRef?.current;

//     if (!topDiv) return;

//     const distanceFromBottom =
//       topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;

//     // Show button if we're more than 400px from bottom
//     setShowScrollButton(distanceFromBottom > 400);

//     // Load more if we're at top
//     if (topDiv.scrollTop === 0 && shouldLoadMore) {
//       loadMore();
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
//       if (!hasInitialized && bottomDiv) {
//         setHasInitialized(true);
//         return true;
//       }
//       if (!topDiv) {
//         return false;
//       }
//       const distanceFromBottom =
//         topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;
//       return distanceFromBottom <= 200;
//     };

//     if (shouldAutoScroll()) {
//       bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//       setShowScrollButton(false);
//     } else {
//       // Update button visibility
//       handleScroll();
//     }
//   }, [bottomRef, chatRef, count, hasInitialized]);

//   const scrollToBottom = () => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//     setShowScrollButton(false);
//   };

//   return {
//     showScrollButton,
//     scrollToBottom,
//   };
// };
import { useEffect, useState } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  count: number;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  count,
}: ChatScrollProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Function to check scroll position and update button visibility
  const handleScroll = () => {
    const topDiv = chatRef?.current;

    if (!topDiv) return;

    const distanceFromBottom =
      topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;

    // Show scroll button if we're more than 400px from bottom
    setShowScrollButton(distanceFromBottom > 400);

    // Load more if we're at top
    if (topDiv.scrollTop === 0 && shouldLoadMore) {
      loadMore();
    }

    // Update user scrolling state
    if (distanceFromBottom > 200) {
      setIsUserScrolling(true);
    } else {
      setIsUserScrolling(false);
    }
  };

  // Add scroll listener
  useEffect(() => {
    const topDiv = chatRef?.current;
    if (topDiv) {
      topDiv.addEventListener("scroll", handleScroll);
      // Check initial scroll position
      handleScroll();
    }

    return () => {
      if (topDiv) {
        topDiv.removeEventListener("scroll", handleScroll);
      }
    };
  }, [chatRef, shouldLoadMore]);

  // Auto-scroll logic
  useEffect(() => {
    const bottomDiv = bottomRef?.current;
    const topDiv = chatRef?.current;

    const shouldAutoScroll = () => {
      // Always scroll on initialization
      if (!hasInitialized && bottomDiv) {
        setHasInitialized(true);
        return true;
      }

      if (!topDiv) {
        return false;
      }

      const distanceFromBottom =
        topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;

      // Auto-scroll if user is within 200px of bottom or not actively scrolling up
      return distanceFromBottom <= 200 || !isUserScrolling;
    };

    if (shouldAutoScroll()) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowScrollButton(false);
      }, 100);
    } else {
      // Update button visibility
      handleScroll();
    }
  }, [bottomRef, chatRef, count, hasInitialized, isUserScrolling]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
    setIsUserScrolling(false);
  };

  return {
    showScrollButton,
    scrollToBottom,
  };
};
