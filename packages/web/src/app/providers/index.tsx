"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalScrollbar } from "mac-scrollbar";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalScrollbar skin="dark" />
      <Toaster position="top-right" richColors />
      {children}
    </QueryClientProvider>
  );
}
