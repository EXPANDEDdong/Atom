"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function Providers({ children }: { children: React.ReactNode }) {
  const client = new QueryClient();

  return (
    <QueryClientProvider client={client}>
      <ReactQueryDevtools initialIsOpen={true} client={client} />
      {children}
    </QueryClientProvider>
  );
}
