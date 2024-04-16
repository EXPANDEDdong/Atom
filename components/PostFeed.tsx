"use client";

import { type FetchParameters, getPosts } from "@/utils/actions";
import { useInfiniteQuery } from "@tanstack/react-query";
import Post, { memoizedDateFormat } from "./Post";
import { Fragment, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

export default function PostFeed({
  currentUser,
  initialIds,
  fetchParameters,
  queryKey,
  isReplies,
}: {
  currentUser: string | null;
  initialIds: string[];
  fetchParameters: FetchParameters;
  queryKey: string;
  isReplies: boolean;
}) {
  const [loadedInitial, setLoadedInitial] = useState(false);
  const [fetchedIds, setFetchedIds] = useState<string[]>([]);
  const { ref, inView } = useInView({ delay: 1000 });

  const { data, error, fetchNextPage, isFetching } = useInfiniteQuery({
    queryKey: [
      queryKey,
      fetchParameters.type === "search"
        ? fetchParameters.searchQuery
        : fetchParameters.type,
    ],
    queryFn: async ({ pageParam }) => {
      const data = await getPosts({
        fetchParameters,
        pageParameters: pageParam,
      });
      if (typeof data === "string" || !data) {
        return Promise.reject(new Error(data));
      }

      if (fetchParameters.type !== "personal") {
        return data;
      }

      const newIds = data.data.map((post) => post.id);

      const uniquePosts = data.data.filter(
        (post) => !fetchedIds.includes(post.id)
      );

      if (!loadedInitial) {
        setFetchedIds(initialIds);
        setLoadedInitial(true);
      }

      setFetchedIds((prevIds) => [...prevIds, ...newIds]);

      return { ...data, data: uniquePosts };
    },
    initialPageParam: { totalPage: 0, recommendationIndex: 1, pageOnIndex: 0 },
    getNextPageParam: (nextPage) => {
      const { newParameters } = nextPage;
      const { newPageOnIndex, newTotalPage, newRecommendationIndex } =
        newParameters;
      return {
        totalPage: newTotalPage,
        recommendationIndex: newRecommendationIndex,
        pageOnIndex: newPageOnIndex,
      };
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  return (
    <div className="w-full h-full flex flex-col gap-2 py-2 pb-18">
      {data?.pages.map((page, i) => (
        <Fragment key={i}>
          {page?.data.map((post, key) => {
            const userDescription =
              post.profiles.description.length > 70
                ? `${post.profiles.description.slice(0, 70)}...`
                : post.profiles.description;

            const postCreatedAt = memoizedDateFormat(post.created_at);

            return (
              <Post
                key={key}
                currentId={currentUser}
                id={post.id}
                postData={{
                  createdAt: postCreatedAt,
                  text: post.text,
                  hasImages: post.has_images,
                  images: post.images,
                  replyTo: isReplies ? null : post.reply_to,
                }}
                postStats={{
                  likes: post.likecount,
                  saves: post.savecount,
                  views: post.viewcount,
                  replies: post.reply_count,
                }}
                interactions={{
                  hasLiked: post.has_liked,
                  hasSaved: post.has_saved,
                }}
                poster={{
                  authorId: post.profiles.author_id,
                  username: post.profiles.username,
                  displayName: post.profiles.displayname,
                  avatarUrl: post.profiles.avatar_url,
                  description: userDescription,
                }}
                isOnOwnPage={false}
              />
            );
          })}
        </Fragment>
      ))}
      {error && <span>{error.message}</span>}
      {isFetching && (
        <div className="flex flex-row gap-4 justify-center py-4">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading...</span>
        </div>
      )}
      <div ref={ref}></div>
    </div>
  );
}
