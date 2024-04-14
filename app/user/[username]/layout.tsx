"use server";

import { getUserPageProfile } from "@/utils/actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Suspense } from "react";
import PostFeedSkeleton from "@/components/PostFeedSkeleton";
import NewDmButton from "@/components/NewDmButton";
import BlockButton from "@/components/BlockButton";
import FollowButton from "@/components/FollowButton";
import EditButton from "@/components/EditButton";
import BackButton from "@/components/BackButton";
import type { Metadata, ResolvingMetadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

type Props = {
  children: React.ReactNode;
  params: { username: string };
};

export async function generateMetadata(
  { children, params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const username = params.username;

  const cookieStore = cookies();
  const db = createClient(cookieStore);

  const { data } = await db
    .from("profiles")
    .select("displayname")
    .eq("username", username)
    .maybeSingle();

  if (!data || !data.displayname)
    return {
      title: "Atom | Unknown user",
    };

  const name = data.displayname;

  const metadata: Metadata = {
    title: `Atom | ${name}`,
  };

  return metadata;
}

export default async function Layout({ children, params }: Props) {
  const userPage = await getUserPageProfile(params.username);

  if (!userPage) {
    notFound();
  }

  if (userPage === "blocked")
    return (
      <main className="w-full flex flex-col items-center justify-center py-14">
        <p className="text-2xl text-center">
          {params.username} has blocked you.
        </p>

        <BackButton />
      </main>
    );

  return (
    <main className="w-full flex flex-col items-center">
      <div className="lg:w-1/2 sm:w-2/3 w-full">
        <div className="flex flex-col gap-4">
          <div className="w-full flex justify-between space-x-4 pt-8">
            <div className="relative flex h-32 w-32 overflow-hidden rounded-full -z-10">
              <Image
                src={userPage.avatar_url}
                alt={`User avatar`}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-1 grow">
              <div>
                <h1 className="text-4xl font-semibold">
                  {userPage.displayname}
                </h1>
                <p className="text-lg text-neutral-400">@{params.username}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <EditButton userId={userPage.id} />
            <Label htmlFor="bio">Description</Label>
            <div id="bio" className="px-2 py-1">
              <p className="text-lg">{userPage.description}</p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <FollowButton
              hasFollowed={userPage.has_followed}
              username={userPage.displayname}
              userId={userPage.id}
            />
            <div className="w-full flex flex-row gap-2">
              <NewDmButton userId={userPage.id} />
              <BlockButton
                hasBlocked={userPage.has_blocked}
                username={userPage.displayname}
                userId={userPage.id}
              />
            </div>
          </div>
        </div>
        <Separator className="mt-4" />
        <Suspense fallback={<PostFeedSkeleton />}>{children}</Suspense>
      </div>
    </main>
  );
}
