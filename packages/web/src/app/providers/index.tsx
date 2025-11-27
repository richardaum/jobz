"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { GlobalScrollbar } from "mac-scrollbar";

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
      {children}
    </QueryClientProvider>
  );
}
