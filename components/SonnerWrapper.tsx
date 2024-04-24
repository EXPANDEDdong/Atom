"use client";
import React, { useEffect, useState } from "react";
import { Toaster } from "./ui/sonner";
import { useSonner } from "sonner";

export default function SonnerWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loadedInitial, setInitial] = useState(false);
  const { toasts } = useSonner();

  useEffect(() => {
    if (toasts && loadedInitial) {
      if (toasts.length === 0) {
        const toasters = document.getElementsByClassName("sonnertoaster");
        const toaster = toasters[0];
        if (toaster && toaster.hasChildNodes()) {
          const children = toaster.children;
          for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;

            child.style.setProperty("zIndex", "-20", "important");
            child.style.setProperty("display", "none", "important");
          }
        }
      }
    }
    if (!loadedInitial) {
      setInitial(true);
    }
  }, [toasts, loadedInitial]);
  return (
    <>
      {children}
      <Toaster richColors />
    </>
  );
}
