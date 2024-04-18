"use server";

import PostFeed from "@/components/PostFeed";
import PostFeedSkeleton from "@/components/PostFeedSkeleton";
import PostForm from "@/components/PostForm";
import {
  type FetchParameters,
  getCurrentUser,
  getPosts,
} from "@/utils/actions";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { Suspense } from "react";

export default async function Home() {
  const queryClient = new QueryClient();

  const currentUser = await getCurrentUser();

  const queryKey = "posts";

  const fetchParameters: FetchParameters = {
    type: "all",
    searchQuery: null,
    postId: null,
    userId: null,
  };

  await queryClient.prefetchInfiniteQuery({
    queryKey: [queryKey, fetchParameters.type],
    queryFn: async ({ pageParam }) => {
      const data = await getPosts({
        fetchParameters,
        pageParameters: pageParam,
      });
      if (typeof data === "string") {
        return Promise.reject(new Error(data));
      }
      return data;
    },
    initialPageParam: { totalPage: 0, recommendationIndex: 1, pageOnIndex: 0 },
  });
  return (
    <main className="flex flex-col items-center min-h-screen">
      <div className="w-full h-full lg:w-1/2 sm:w-2/3">
        <PostForm
          queryKey={[queryKey, fetchParameters.type]}
          replyToId={null}
        />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <PostFeed
            currentUser={currentUser}
            initialIds={[]}
            fetchParameters={fetchParameters}
            queryKey={queryKey}
            isReplies={false}
          />
        </HydrationBoundary>
      </div>
    </main>
  );
}
