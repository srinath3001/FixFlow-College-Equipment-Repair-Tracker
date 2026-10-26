// FixFlow - Root Application Component
// Provides TanStack QueryClientProvider, AppProvider context, and RouterProvider.

import React from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient.js";
import { AppProvider } from "../context/AppContext.jsx";
import { router } from "./router.jsx";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
