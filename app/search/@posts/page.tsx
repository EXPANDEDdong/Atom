"use client";
import { SessionContext } from "@/app/UserContext";
import PostFeed from "@/components/PostFeed";
import PostFeedSkeleton from "@/components/PostFeedSkeleton";
import { FetchParameters } from "@/utils/actions";
import { useSearchParams } from "next/navigation";
import { useContext, useState } from "react";

export default function SearchPosts() {
  const user = useContext(SessionContext);

  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("q");

  const fetchParameters: FetchParameters = {
    type: "search",
    searchQuery: searchQuery,
    postId: null,
    userId: null,
  };

  if (!user) return <PostFeedSkeleton />;

  return (
    <PostFeed
      queryKey={searchQuery ?? "noquery"}
      fetchParameters={fetchParameters}
      initialIds={[]}
      isReplies={false}
      currentUser={user.id}
    />
  );
}
