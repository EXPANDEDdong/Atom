"use client";
import React from "react";
import { Toaster } from "./ui/sonner";

export default function SonnerWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster richColors />
    </>
  );
}
