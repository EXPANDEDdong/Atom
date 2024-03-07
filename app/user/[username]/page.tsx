"use server";

import PostFeed from "@/components/PostFeed";
import {
  getCurrentUser,
  getUserPageProfile,
  getUserPosts,
} from "@/utils/actions";

export default async function Page({
  params,
}: {
  params: { username: string };
}) {
  const currentUser = await getCurrentUser();

  const userPage = await getUserPageProfile(params.username);

  if (!userPage) return null;

  return (
    <div className="w-full">
      <PostFeed
        currentUser={currentUser}
        fetchFunction={getUserPosts.bind(null, userPage.id, currentUser)}
        queryKey="userposts"
        isReplies={false}
      />
    </div>
  );
}
