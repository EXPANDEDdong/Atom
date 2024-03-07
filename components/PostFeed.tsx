"use client";

import { PostSelectReturn, getPosts } from "@/utils/actions";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutationState,
  useQuery,
} from "@tanstack/react-query";
import Post, { memoizedDateFormat } from "./Post";
import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function PostFeed({
  currentUser,
  fetchFunction,
  queryKey,
  isReplies,
}: {
  currentUser: string | null;
  fetchFunction: (page: number) => Promise<{
    data: PostSelectReturn;
    nextPage: number | null;
    previousPage: number | null;
  } | null>;
  queryKey: string;
  isReplies: boolean;
}) {
  const { ref, inView } = useInView({ delay: 1000 });

  const { data, error, fetchNextPage, isFetching } = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: async ({ pageParam }) => {
      return await fetchFunction(pageParam);
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
      {isFetching && <span>Loading...</span>}
      <div ref={ref}></div>
    </div>
  );
}
