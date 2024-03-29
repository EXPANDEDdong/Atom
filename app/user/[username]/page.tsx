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
import NewDmButton from "@/components/NewDmButton";

export default async function Page({
  params,
  searchParams,
}: {
  params: { username: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const queryClient = new QueryClient();

  const currentUser = await getCurrentUser();

  const userPage = await getUserPageProfile(params.username);

  if (!userPage) return null;

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
  return (
    <div className="w-full">
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
