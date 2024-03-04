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

  if (!userPage)
    throw new Error("This user does not exist", { cause: "Null user data." });

  return (
    <div>
      <p>{params.username}</p>
      <p>{userPage.displayname}</p>
      <PostFeed
        currentUser={currentUser}
        fetchFunction={getUserPosts.bind(null, userPage.id, currentUser)}
        queryKey="userposts"
        isReplies={false}
      />
    </div>
  );
}
