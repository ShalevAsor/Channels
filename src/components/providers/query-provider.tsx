"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
/**
 * Provider component that sets up React Query for the entire application.
 * React Query is used to manage server state, caching, and data synchronization.
 *
 * This provider configures global defaults for how queries should behave,
 * including caching strategies and retry behavior.
 */
export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize QueryClient once and maintain it across re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic retrying of failed queries
            retry: false,
            // Keep data "fresh" for 1 minute
            // During this time, React Query will return cached data without refetching
            staleTime: 60 * 1000,
            // Keep inactive data in memory for 5 minutes
            // After this time, unused data will be garbage collected
            gcTime: 5 * 60 * 1000,
            // Disable automatic refetching when window regains focus
            // This is appropriate for real-time data that updates via Pusher
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
