"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { AspectRatio } from "./ui/aspect-ratio";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Eye, Reply, Heart, Bookmark } from "lucide-react";
import { Separator } from "./ui/separator";
import { likePost, savePost } from "@/utils/actions";
import { useState } from "react";

export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache: Record<string, ReturnType<T>> = {};

  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);

    if (!(key in cache)) {
      cache[key] = func(...args);
    }

    return cache[key];
  } as T;
}

export function formatTimestampToLocal(timestamp: string): string {
  const date = new Date(timestamp);

  const formatter = new Intl.DateTimeFormat("default", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(date);
}

export const memoizedDateFormat = memoize(formatTimestampToLocal);

type PostProps = {
  id: string;
  currentId: string | null;
  postData: {
    text: string;
    replyTo: string | null;
    hasImages: boolean;
    images: string[] | null;
    createdAt: string;
  };
  postStats: {
    likes: number;
    saves: number;
    views: number;
    replies: number;
  };
  interactions: {
    hasLiked: boolean;
    hasSaved: boolean;
  };
  poster: {
    displayName: string | null;
    avatarUrl: string | null;
    username: string;
    description: string | null;
  } | null;
};

export default function Post({
  id,
  currentId,
  postData,
  postStats,
  interactions,
  poster,
}: PostProps) {
  const { createdAt, text, hasImages, images, replyTo } = postData;
  const { likes, saves, views, replies } = postStats;
  const { displayName, username, avatarUrl, description } = poster || {
    displayName: null,
    username: null,
    avatarUrl: null,
    description: null,
  };
  const { hasLiked, hasSaved } = interactions;

  const [likeState, setLikeState] = useState<{
    hasLiked: boolean;
    likeCount: number;
  }>({ hasLiked, likeCount: likes });

  const [saveState, setSaveState] = useState<{
    hasSaved: boolean;
    saveCount: number;
  }>({ hasSaved, saveCount: saves });

  return (
    <div className="w-full h-full">
      <Card className="border-x-0 border-t-0 rounded-none">
        <CardHeader>
          {replyTo && (
            <Button variant={"outline"} asChild>
              <Link href={`/post/${replyTo}`}>View parent post</Link>
            </Button>
          )}
          <div>
            {username ? (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant={"link"} asChild>
                    <Link href={`/user/${username}`}>@{username}</Link>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 h-fit">
                  <div className="w-full flex justify-between space-x-4">
                    <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={
                          avatarUrl ||
                          "https://wjucegfkshgallheqlzz.supabase.co/storage/v1/object/public/images/avatars/no-profile-picture-icon.webp"
                        }
                        alt={`User avatar`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1 grow">
                      <h4 className="text-sm font-semibold">{displayName}</h4>
                      {!!description && <p>{description}</p>}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <Button variant={"link"} disabled>
                User Deleted
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-full flex flex-col gap-4">
            <p className="whitespace-normal">{text}</p>
            {hasImages ? (
              <div className="w-full flex flex-row justify-center">
                <Carousel className="w-10/12">
                  <CarouselContent>
                    {images?.map((img, index) => (
                      <CarouselItem key={index}>
                        <AspectRatio
                          ratio={3 / 1}
                          className="h-full rounded-md"
                        >
                          <Image
                            src={img}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover rounded-md"
                          />
                        </AspectRatio>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            ) : null}
            <div className="flex flex-row gap-2 items-center">
              <CardDescription>
                <span className="flex flex-row gap-1 items-center">
                  <Eye /> {views}
                </span>
              </CardDescription>
              <Separator orientation="vertical" className="h-6" />
              <CardDescription>
                <span className="flex flex-row gap-1 items-center">
                  <Reply /> {replies}
                </span>
              </CardDescription>
              <Separator orientation="vertical" className="h-6" />
              <CardDescription>{createdAt}</CardDescription>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pb-0 px-0">
          <div className="w-full flex flex-row justify-start gap-2 pb-2 px-2">
            <Button
              size={"default"}
              variant={"outline"}
              className={`dark flex flex-row gap-1 ${
                likeState.hasLiked
                  ? "bg-white hover:bg-neutral-200 text-neutral-900 hover:text-neutral-800"
                  : ""
              }`}
              type="submit"
              onClick={async () => {
                if (currentId) {
                  setLikeState({
                    ...likeState,
                    hasLiked: !likeState.hasLiked,
                    likeCount: likeState.hasLiked
                      ? (likeState.likeCount -= 1)
                      : (likeState.likeCount += 1),
                  });

                  await likePost(likeState.hasLiked, id);
                }
              }}
            >
              <Heart /> {likeState.likeCount}
            </Button>

            <Button
              size={"default"}
              variant={"outline"}
              className={`dark flex flex-row gap-1 ${
                saveState.hasSaved
                  ? "bg-white hover:bg-neutral-200 text-neutral-900 hover:text-neutral-800"
                  : ""
              }`}
              type="submit"
              onClick={async () => {
                if (currentId) {
                  setSaveState({
                    ...saveState,
                    hasSaved: !saveState.hasSaved,
                    saveCount: saveState.hasSaved
                      ? (saveState.saveCount -= 1)
                      : (saveState.saveCount += 1),
                  });

                  await savePost(saveState.hasSaved, id);
                }
              }}
            >
              <Bookmark />
              {saveState.saveCount}
            </Button>
            <Button
              size={"default"}
              variant={"outline"}
              className="dark flex flex-row gap-1 items-center"
            >
              <Reply /> Reply
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
