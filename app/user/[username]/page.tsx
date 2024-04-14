"use server";

import PostFeed from "@/components/PostFeed";
import {
  FetchParameters,
  getCurrentUser,
  getPosts,
  getUserPageProfile,
} from "@/utils/actions";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default async function Page({
  params,
  searchParams,
}: {
  params: { username: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const userPage = await getUserPageProfile(params.username);

  const queryClient = new QueryClient();

  const currentUser = await getCurrentUser();

  if (!userPage || userPage === "blocked") return null;

  const queryKey = "userposts";

  const fetchParameters: FetchParameters = {
    type: "user",
    searchQuery: null,
    userId: userPage.id,
    postId: null,
  };

  queryClient.prefetchInfiniteQuery({
    queryKey: [queryKey, fetchParameters.type],
    queryFn: async ({ pageParam }) => {
      return await getPosts({ fetchParameters, pageParameters: pageParam });
    },
    initialPageParam: { totalPage: 0, recommendationIndex: 1, pageOnIndex: 0 },
  });
  return (
    <div className="w-full">
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
  );
}
