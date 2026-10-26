// FixFlow - TanStack React Query Client Setup
// Configures intelligent caching, stale time, and retry policy.

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 20, // 20 seconds before data is considered stale
      gcTime: 1000 * 60 * 5, // 5 minutes cache retention
      refetchOnWindowFocus: false, // Don't aggressively refetch on tab switch
      retry: (failureCount, error) => {
        // DO NOT retry client validation or not-found errors (400, 404, 409)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry network or 500 server errors up to 2 times
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false, // Don't automatically retry failed form submissions
    },
  },
});

export default queryClient;
