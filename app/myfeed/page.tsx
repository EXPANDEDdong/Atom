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
    type: "personal",
    searchQuery: null,
    postId: null,
    userId: null,
  };

  let initialPosts: string[] = [];
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
      data.data.map((post) => initialPosts.push(post.id));

      return data;
    },
    initialPageParam: { totalPage: 0, recommendationIndex: 1, pageOnIndex: 0 },
  });
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="h-full lg:w-1/2 sm:w-2/3 w-full">
        <PostForm
          queryKey={[queryKey, fetchParameters.type]}
          replyToId={null}
        />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<PostFeedSkeleton />}>
            <PostFeed
              currentUser={currentUser}
              initialIds={initialPosts}
              fetchParameters={fetchParameters}
              queryKey={queryKey}
              isReplies={false}
            />
          </Suspense>
        </HydrationBoundary>
      </div>
    </main>
  );
}
