"use server";

import PostSkeleton from "@/components/PostSkeleton";
import { Suspense } from "react";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<PostSkeleton />}>{children}</Suspense>;
}
