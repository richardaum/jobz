"use client";

import { ReactNode } from "react";
import { GlobalScrollbar } from "mac-scrollbar";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      <GlobalScrollbar skin="dark" />
      {children}
    </>
  );
}
