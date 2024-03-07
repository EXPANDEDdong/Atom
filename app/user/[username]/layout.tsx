"use server";

import { getUserPageProfile } from "@/utils/actions";
import { notFound } from "next/navigation";

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Suspense } from "react";
import PostFeedSkeleton from "@/components/PostFeedSkeleton";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { username: string };
}) {
  const userPage = await getUserPageProfile(params.username);

  if (!userPage) {
    notFound();
  }
  return (
    <main className="pw-full flex flex-col items-center">
      <div className="w-1/2">
        <div className="flex flex-col gap-4">
          <div className="w-full flex justify-between space-x-4 pt-8">
            <div className="relative flex h-32 w-32 overflow-hidden rounded-full">
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
            <Label htmlFor="bio">Description</Label>
            <div id="bio" className="px-2 py-1">
              <p className="text-lg">{userPage.description}</p>
            </div>
          </div>
        </div>
        <Separator className="mt-4" />
        <Suspense fallback={<PostFeedSkeleton />}>{children}</Suspense>
      </div>
    </main>
  );
}
