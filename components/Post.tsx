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
import { use, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast as sonner } from "sonner";
import { SessionContext } from "@/app/UserContext";

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

  const user = use(SessionContext);

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
        {id === "posting" && (
          <div className="w-full h-full flex justify-center items-center absolute bg-neutral-900/40 opacity-70 z-40">
            <div className="flex flex-row gap-4 justify-center py-4 z-50">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Posting...</span>
            </div>
          </div>
        )}
        {!isOnOwnPage && id !== "posting" && (
          <Link
            href={`/post/${id}`}
            className="absolute z-10 block w-full h-full bg-transparent hover:bg-neutral-900/55 opacity-70"
          ></Link>
        )}
        <CardHeader className="relative">
          {replyTo && (
            <Button
              variant={"outline"}
              disabled={id === "posting"}
              className="z-20"
              asChild
            >
              <Link href={`/post/${replyTo}`}>View parent post</Link>
            </Button>
          )}
          <div>
            {username ? (
              <Button
                variant={"ghost"}
                className="relative z-20 px-1 py-1 h-fit w-fit"
                disabled={id === "posting"}
                asChild
              >
                <Link href={`/user/${username}`}>
                  <div className="inline-flex flex-row gap-4">
                    <div className="relative flex w-10 h-10 overflow-hidden rounded-full shrink-0">
                      <Image
                        src={
                          avatarUrl ||
                          "https://wjucegfkshgallheqlzz.supabase.co/storage/v1/object/public/images/avatars/no-profile-picture-icon.webp"
                        }
                        alt={`User avatar`}
                        fill
                        sizes="20vw"
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
          <div className="flex flex-col w-full h-full gap-4">
            <p className="relative z-20 max-w-full whitespace-pre-line w-fit">
              {text}
            </p>
            {hasImages ? (
              <div className="flex flex-row justify-center w-full">
                <Carousel className="relative z-20 w-10/12">
                  <CarouselContent>
                    {images?.map((img, index) => (
                      <CarouselItem key={index}>
                        <AspectRatio
                          ratio={3 / 2}
                          className="relative max-h-full"
                        >
                          <Image
                            src={img}
                            alt={`Image ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-contain"
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
            <div className="relative z-20 flex flex-row items-center gap-2 w-fit">
              <CardDescription>
                <span className="flex flex-row items-center gap-1">
                  <Eye /> {views}
                </span>
              </CardDescription>
              <Separator orientation="vertical" className="h-6" />
              <CardDescription>
                <span className="flex flex-row items-center gap-1">
                  <Reply /> {replies}
                </span>
              </CardDescription>
              <Separator orientation="vertical" className="h-6" />
              <CardDescription>{createdAt}</CardDescription>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-0 pb-0">
          <div className="flex flex-row justify-between w-full px-2 pb-2">
            <div className="flex flex-row gap-2">
              <Button
                size={"default"}
                variant={"ghost"}
                className={`dark relative flex flex-row gap-1 z-20`}
                type="submit"
                disabled={id === "posting"}
                onClick={async () => {
                  if (user) {
                    setLikeState({
                      ...likeState,
                      hasLiked: !likeState.hasLiked,
                      likeCount: likeState.hasLiked
                        ? (likeState.likeCount -= 1)
                        : (likeState.likeCount += 1),
                    });

                    await likePost(likeState.hasLiked, id);
                  } else {
                    sonner.warning("You are not logged in.", {
                      duration: 4000,
                    });
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
                disabled={id === "posting"}
                onClick={async () => {
                  if (user) {
                    setSaveState({
                      ...saveState,
                      hasSaved: !saveState.hasSaved,
                      saveCount: saveState.hasSaved
                        ? (saveState.saveCount -= 1)
                        : (saveState.saveCount += 1),
                    });

                    await savePost(saveState.hasSaved, id);
                  } else {
                    sonner.warning("You are not logged in.", {
                      duration: 4000,
                    });
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
                  disabled={id === "posting"}
                  className="relative z-20 flex flex-row items-center gap-1 dark"
                  asChild
                >
                  <Link href={`/post/${id}?reply`}>
                    <Reply />
                  </Link>
                </Button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"default"}
                  variant={"ghost"}
                  disabled={id === "posting"}
                  className="relative z-20 flex flex-row items-center gap-1 dark"
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="flex flex-row w-full gap-4 px-4"
                  asChild
                >
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        `${window.location.host}/post/${id}`
                      );
                      sonner.info("URL copied to clipboard.", {
                        duration: 3000,
                      });
                    }}
                  >
                    <Share strokeWidth={2} width={16} height={16} /> Share
                  </button>
                </DropdownMenuItem>
                {currentId === authorId && (
                  <DropdownMenuItem
                    className="flex flex-row w-full gap-4 px-4 text-red-500"
                    asChild
                  >
                    <button
                      onClick={async () => {
                        if (user) {
                          if (user.id === authorId && currentId === authorId) {
                            const deleteRes = await deletePost(id, authorId);
                            if (deleteRes === 401) {
                              sonner.error(
                                "You are not authorized to delete this post.",
                                {
                                  duration: 4000,
                                }
                              );
                            }
                            if (deleteRes === 400) {
                              sonner.error("Error while deleting post.", {
                                description: "Please try again later.",
                                duration: 4000,
                              });
                            }
                            if (deleteRes === 200) {
                              setIsDeleted(true);
                              sonner.success("Post deleted successfully.", {
                                duration: 4000,
                              });
                            }
                          } else {
                            sonner.error(
                              "You are not authorized to delete this post.",
                              {
                                duration: 4000,
                              }
                            );
                          }
                        } else {
                          sonner.warning("You are not logged in.", {
                            duration: 4000,
                          });
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
