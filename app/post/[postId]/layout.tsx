"use server";

import PostSkeleton from "@/components/PostSkeleton";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Suspense } from "react";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<PostSkeleton />}>{children}</Suspense>;
}
