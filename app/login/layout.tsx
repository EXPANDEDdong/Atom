"use client";
import dynamic from "next/dynamic";

const Sonner = dynamic(() =>
  import("@/components/ui/sonner").then((mod) => mod.Toaster)
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Sonner />
    </>
  );
}
