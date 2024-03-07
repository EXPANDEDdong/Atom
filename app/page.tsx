"use server";

import PostFeed from "@/components/PostFeed";
import PostFeedSkeleton from "@/components/PostFeedSkeleton";
import PostForm from "@/components/PostForm";
import { getCurrentUser, getPosts } from "@/utils/actions";
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

  await queryClient.prefetchInfiniteQuery({
    queryKey: [queryKey],
    queryFn: async ({ pageParam }) => {
      return await getPosts(currentUser, pageParam);
    },
    initialPageParam: 0,
  });

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="h-full lg:w-2/3">
        <PostForm />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<PostFeedSkeleton />}>
            <PostFeed
              currentUser={currentUser}
              fetchFunction={getPosts.bind(null, currentUser)}
              queryKey={queryKey}
              isReplies={false}
            />
          </Suspense>
        </HydrationBoundary>
      </div>
    </main>
  );
}
