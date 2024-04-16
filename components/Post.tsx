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
import {
  Eye,
  Reply,
  Heart,
  Bookmark,
  MoreHorizontal,
  Share,
  Trash2,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { deletePost, likePost, savePost } from "@/utils/actions";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast as sonner } from "sonner";

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
    authorId: string;
    displayName: string;
    avatarUrl: string;
    username: string;
    description: string;
  };
  isOnOwnPage: boolean;
};

export default function Post({
  id,
  currentId,
  postData,
  postStats,
  interactions,
  poster,
  isOnOwnPage,
}: PostProps) {
  const { createdAt, text, hasImages, images, replyTo } = postData;
  const { likes, saves, views, replies } = postStats;
  const { authorId, displayName, username, avatarUrl } = poster;
  const { hasLiked, hasSaved } = interactions;

  const [isDeleted, setIsDeleted] = useState(false);

  const [likeState, setLikeState] = useState<{
    hasLiked: boolean;
    likeCount: number;
  }>({ hasLiked, likeCount: likes });

  const [saveState, setSaveState] = useState<{
    hasSaved: boolean;
    saveCount: number;
  }>({ hasSaved, saveCount: saves });

  if (isDeleted) return null;

  return (
    <div className="w-full h-full">
      <Card className="relative">
        {!isOnOwnPage && (
          <Link
            href={`/post/${id}`}
            className="block w-full h-full absolute z-10 hover:bg-neutral-900/55 opacity-70 bg-transparent"
          ></Link>
        )}
        <CardHeader className="relative">
          {replyTo && (
            <Button variant={"outline"} className="z-20" asChild>
              <Link href={`/post/${replyTo}`}>View parent post</Link>
            </Button>
          )}
          <div>
            {username ? (
              <Button
                variant={"ghost"}
                className="h-fit w-fit px-1 py-1 z-20 relative"
                asChild
              >
                <Link href={`/user/${username}`}>
                  <div className="inline-flex flex-row gap-4">
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
                    <div className="flex flex-col">
                      <h4 className="text-sm font-semibold">{displayName}</h4>
                      <p className="text-xs font-normal text-neutral-400">
                        {username}
                      </p>
                    </div>
                  </div>
                </Link>
              </Button>
            ) : (
              <Button variant={"link"} className="z-20" disabled>
                User Deleted
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-full flex flex-col gap-4">
            <p className="whitespace-normal z-20 relative w-fit max-w-full">
              {text}
            </p>
            {hasImages ? (
              <div className="w-full flex flex-row justify-center">
                <Carousel className="w-10/12 z-20 relative">
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
            <div className="flex flex-row gap-2 items-center z-20 relative w-fit">
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
          <div className="w-full flex flex-row justify-between pb-2 px-2">
            <div className="flex flex-row gap-2">
              <Button
                size={"default"}
                variant={"ghost"}
                className={`dark relative flex flex-row gap-1 z-20`}
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
                <Heart fill={likeState.hasLiked ? "white" : "transparent"} />{" "}
                {likeState.likeCount}
              </Button>

              <Button
                size={"default"}
                variant={"ghost"}
                className={`dark flex relative flex-row gap-1 z-20`}
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
                <Bookmark fill={saveState.hasSaved ? "white" : "transparent"} />
                {saveState.saveCount}
              </Button>
              {!isOnOwnPage && (
                <Button
                  size={"default"}
                  variant={"ghost"}
                  className="dark flex relative flex-row gap-1 items-center z-20"
                >
                  <Reply />
                </Button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"default"}
                  variant={"ghost"}
                  className="dark flex relative flex-row gap-1 items-center z-20"
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="w-full flex flex-row px-4 gap-4"
                  asChild
                >
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        `${window.location.host}/post/${id}`
                      );
                    }}
                  >
                    <Share strokeWidth={2} width={16} height={16} /> Share
                  </button>
                </DropdownMenuItem>
                {currentId === authorId && (
                  <DropdownMenuItem
                    className="w-full flex flex-row px-4 gap-4 text-red-500"
                    asChild
                  >
                    <button
                      onClick={async () => {
                        const uploadRes = await deletePost(id, authorId);
                        if (uploadRes === 401) {
                          sonner("You are not authorized to delete this post.");
                        }
                        if (uploadRes === 400) {
                          sonner("Error while deleting post.", {
                            description: "Please try again later.",
                          });
                        }
                        if (uploadRes === 200) {
                          setIsDeleted(true);
                        }
                      }}
                    >
                      <Trash2 strokeWidth={2} width={16} height={16} /> Delete
                    </button>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
