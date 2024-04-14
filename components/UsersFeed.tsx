import { searchUsers } from "@/utils/actions";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Image from "next/image";
import { Label } from "./ui/label";
import Link from "next/link";

export default function UsersFeed({ searchQuery }: { searchQuery: string }) {
  const { ref, inView } = useInView({ delay: 1000 });

  const { data, error, fetchNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["searchUsers", searchQuery],
    queryFn: async ({ pageParam }) => {
      const data = await searchUsers({
        query: searchQuery,
        page: pageParam,
      });
      if (typeof data === "string" || !data) {
        return Promise.reject(new Error(data));
      }

      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (nextPage) => nextPage.nextPage,
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
          {page.data.map((user, key) => (
            <Card key={key} className="relative">
              <Link
                href={`/user/${user.username}`}
                className="block w-full h-full absolute z-10 hover:bg-neutral-900/55 opacity-70 bg-transparent"
              ></Link>
              <CardHeader>
                <div className="w-full flex flex-row gap-2">
                  <div className="relative flex h-14 w-14 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={user.avatar_url}
                      alt={`User avatar`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <CardTitle>{user.displayname}</CardTitle>
                    <CardDescription>{user.username}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <Label>Description</Label>
                  <CardDescription>{user.description}</CardDescription>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex flex-row *:w-full *:flex *:flex-col *:items-center">
                  <div>
                    <CardDescription>
                      <span className="text-card-foreground">
                        {user.following}
                      </span>{" "}
                      following
                    </CardDescription>
                  </div>
                  <div>
                    <CardDescription>
                      <span className="text-card-foreground">
                        {user.followers}
                      </span>{" "}
                      followers
                    </CardDescription>
                  </div>
                  <div>
                    <CardDescription>
                      <span className="text-card-foreground">
                        {user.postcount}
                      </span>{" "}
                      posts
                    </CardDescription>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
