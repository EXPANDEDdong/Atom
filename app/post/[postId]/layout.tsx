"use server";

import PostSkeleton from "@/components/PostSkeleton";
import { createClient } from "@/utils/supabase/server";
import type { Metadata, ResolvingMetadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";

type Props = {
  children: React.ReactNode;
  params: { postId: string };
};

export async function generateMetadata(
  { children, params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.postId;

  const cookieStore = cookies();
  const db = createClient(cookieStore);

  const { data, error } = await db
    .from("posts")
    .select(
      `
  id,
  profiles!public_posts_author_id_fkey(displayname)
  `
    )
    .eq("id", id)
    .maybeSingle();

  const name = data?.profiles?.displayname ?? "Unknown user";

  const metadata: Metadata = {
    title: `Atom | Post by ${name}`,
  };

  return metadata;
}

export default async function layout({ children, params }: Props) {
  return (
    <main className="flex flex-col items-center w-full h-full">
      <Suspense fallback={<PostSkeleton />}>{children}</Suspense>
    </main>
  );
}
