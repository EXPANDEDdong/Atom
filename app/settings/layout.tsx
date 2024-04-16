import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="h-full lg:w-1/2 sm:w-2/3 w-full">{children}</div>
    </main>
  );
}
