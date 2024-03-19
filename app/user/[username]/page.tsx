"use server";

import PostFeed from "@/components/PostFeed";
import {
  FetchParameters,
  getCurrentUser,
  getPosts,
  getUserPageProfile,
  getUserPosts,
} from "@/utils/actions";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { newChat } from "@/app/testing/actions";
import { Button } from "@/components/ui/button";

export default async function Page({
  params,
  searchParams,
}: {
  params: { username: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  console.time("loading");
  const queryClient = new QueryClient();

  const currentUser = await getCurrentUser();

  const userPage = await getUserPageProfile(params.username);

  if (!userPage) return null;

  const balls = newChat.bind(null, currentUser!, false, [userPage.id]);

  const fetchParams: FetchParameters<"user"> = {
    type: "user",
    userId: userPage.id,
    imagesOnly: false,
  };

  queryClient.prefetchInfiniteQuery({
    queryKey: ["userposts"],
    queryFn: async ({ pageParam }) => {
      return await getPosts(fetchParams, currentUser, pageParam);
    },
    initialPageParam: 0,
  });
  console.timeEnd("loading");
  return (
    <div className="w-full">
      <form action={balls}>
        <Button type="submit">test it</Button>
      </form>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PostFeed
          currentUser={currentUser}
          fetchParameters={fetchParams}
          queryKey={"userposts"}
          isReplies={false}
        />
      </HydrationBoundary>
    </div>
  );
}
