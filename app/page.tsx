"use server";

import PostFeed from "@/components/PostFeed";
import PostFeedSkeleton from "@/components/PostFeedSkeleton";
import PostForm from "@/components/PostForm";
import { FetchParameters, getCurrentUser, getPosts } from "@/utils/actions";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { devNull } from "os";
import { Suspense } from "react";

export default async function Home() {
  const queryClient = new QueryClient();

  const currentUser = await getCurrentUser();

  const queryKey = "posts";

  const fetchParams: FetchParameters<"all"> = {
    type: "all",
  };

  await queryClient.prefetchInfiniteQuery({
    queryKey: [queryKey],
    queryFn: async ({ pageParam }) => {
      return await getPosts(fetchParams, currentUser, pageParam);
    },
    initialPageParam: 0,
  });
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="h-full lg:w-2/3">
        <PostForm queryKey={queryKey} replyToId={null} />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<PostFeedSkeleton />}>
            <PostFeed
              currentUser={currentUser}
              fetchParameters={fetchParams}
              queryKey={queryKey}
              isReplies={false}
            />
          </Suspense>
        </HydrationBoundary>
      </div>
    </main>
  );
}
