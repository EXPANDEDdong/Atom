"use client";

import UsersFeed from "@/components/UsersFeed";
import { useSearchParams } from "next/navigation";

export default function SearchUsers() {
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("q");

  return <UsersFeed searchQuery={searchQuery!} />;
}
