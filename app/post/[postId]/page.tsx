"use server";

import { FetchParameters, getCurrentUser, getPosts } from "@/utils/actions";
import { getPostPage, getSinglePost } from "./actions";
import Post from "@/components/Post";
import PostFeed from "@/components/PostFeed";
import PostForm from "@/components/PostForm";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default async function PostPage({
  params,
}: {
  params: { postId: string };
}) {
  const user = await getCurrentUser();
  const post = await getSinglePost(params.postId);

  if (!post) return null;

  const queryClient = new QueryClient();

  const queryKey = "postreplies";

  const fetchParameters: FetchParameters = {
    type: "replies",
    searchQuery: null,
    postId: params.postId,
    userId: null,
  };

  const userDescription =
    post.profiles.description.length > 70
      ? `${post.profiles.description.slice(0, 70)}...`
      : post.profiles?.description;

  const date = new Date(post.created_at);

  const formatter = new Intl.DateTimeFormat("default", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const postCreatedAt = formatter.format(date);

  queryClient.prefetchInfiniteQuery({
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
    <div className="lg:w-1/2 sm:w-2/3 w-full h-full py-2">
      <div>
        <Post
          currentId={user}
          id={post.id}
          postData={{
            createdAt: postCreatedAt,
            text: post.text,
            hasImages: post.has_images,
            images: post.images,
            replyTo: post.reply_to,
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
          isOnOwnPage={true}
        />
      </div>
      <div>
        <PostForm
          queryKey={[queryKey, fetchParameters.type]}
          replyToId={params.postId}
        />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <PostFeed
            currentUser={user}
            initialIds={[]}
            fetchParameters={fetchParameters}
            queryKey={queryKey}
            isReplies={true}
          />
        </HydrationBoundary>
      </div>
    </div>
  );
}
