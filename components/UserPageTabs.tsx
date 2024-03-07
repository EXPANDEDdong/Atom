"use client";
import { redirect, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import Link from "next/link";

export default function UserPageTabs({ username }: { username: string }) {
  const params = useSearchParams();

  const list = params.get("list");

  return (
    <Tabs className="w-full" defaultValue={list ?? "all"}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="all" asChild>
          <Link
            href={{
              pathname: `/user/${username}`,
              query: { list: "all" },
            }}
          >
            All posts
          </Link>
        </TabsTrigger>
        <TabsTrigger value="media" asChild>
          <Link
            href={{
              pathname: `/user/${username}`,
              query: { list: "media" },
            }}
          >
            Has media
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
