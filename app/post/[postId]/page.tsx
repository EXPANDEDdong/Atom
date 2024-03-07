"use server";

import { getCurrentUser } from "@/utils/actions";
import { getPostPage, getPostReplies } from "./actions";
import Post from "@/components/Post";
import PostFeed from "@/components/PostFeed";
import PostForm from "@/components/PostForm";

export default async function PostPage({
  params,
}: {
  params: { postId: string };
}) {
  const user = await getCurrentUser();

  const post = await getPostPage(user, params.postId);

  if (!post) return null;

  const userDescription =
    !!post.profiles?.description && post.profiles.description.length > 70
      ? `${post.profiles.description.slice(0, 70)}...`
      : post.profiles?.description || null;

  const posterData =
    post.profiles && post.profiles.displayname && post.profiles.username
      ? {
          displayName: post.profiles.displayname,
          username: post.profiles.username,
          avatarUrl: post.profiles.avatar_url,
          description: userDescription,
        }
      : null;

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

  const userLike = post.userlike ? post.userlike[0] : undefined;
  const userSave = post.usersave ? post.usersave[0] : undefined;

  const userHasLiked = userLike?.count;
  const userHasSaved = userSave?.count;

  const replyToId = post.reply_to.length > 0 ? post.reply_to[0].posts.id : null;

  return (
    <main>
      <div>
        <Post
          currentId={user}
          id={post.id}
          postData={{
            createdAt: postCreatedAt,
            text: post.text,
            hasImages: post.has_images,
            images: post.images,
            replyTo: replyToId,
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
      </div>
      <div>
        <PostForm />

        <PostFeed
          currentUser={user}
          fetchFunction={getPostReplies.bind(null, user, params.postId)}
          queryKey="postreplies"
          isReplies={true}
        />
      </div>
    </main>
  );
}
