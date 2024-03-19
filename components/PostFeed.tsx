"use client";

import { FetchParameters, PostSelectReturn, getPosts } from "@/utils/actions";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import Post, { memoizedDateFormat } from "./Post";
import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function PostFeed<T extends "all" | "user" | "replies">({
  currentUser,
  fetchParameters,
  queryKey,
  isReplies,
}: {
  currentUser: string | null;
  fetchParameters: FetchParameters<T>;
  queryKey: string;
  isReplies: boolean;
}) {
  const { ref, inView } = useInView({ delay: 1000 });

  const { data, error, fetchNextPage, isFetching } = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: async ({ pageParam }) => {
      return await getPosts(fetchParameters, currentUser, pageParam);
    },
    initialPageParam: 0,
    getNextPageParam: (nextPage) => nextPage?.nextPage ?? undefined,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  return (
    <div className="w-full h-full flex flex-col gap-2 px-1">
      {data?.pages.map((page, i) => (
        <Fragment key={i}>
          {page?.data.map((post, key) => {
            const userDescription =
              !!post.profiles?.description &&
              post.profiles.description.length > 70
                ? `${post.profiles.description.slice(0, 70)}...`
                : post.profiles?.description || null;

            const posterData =
              post.profiles &&
              post.profiles.displayname &&
              post.profiles.username
                ? {
                    displayName: post.profiles.displayname,
                    username: post.profiles.username,
                    avatarUrl: post.profiles.avatar_url,
                    description: userDescription,
                  }
                : null;

            const postCreatedAt = memoizedDateFormat(post.created_at);

            const userLike = post.userlike ? post.userlike[0] : undefined;
            const userSave = post.usersave ? post.usersave[0] : undefined;

            const userHasLiked = userLike?.count;
            const userHasSaved = userSave?.count;

            const replyToId =
              post.reply_to.length > 0 ? post.reply_to[0].posts.id : null;

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
                  replyTo: !isReplies ? replyToId : null,
                }}
                postStats={{
                  likes: post.likecount[0].count,
                  saves: post.savecount[0].count,
                  views: post.viewcount[0].count,
                  replies: post.replies[0]?.posts?.count || 0,
                }}
                interactions={{
                  hasLiked: !!userHasLiked,
                  hasSaved: !!userHasSaved,
                }}
                poster={posterData}
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
