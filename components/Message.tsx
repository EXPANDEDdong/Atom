"use client";
import NextImage from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { CornerUpLeft, CornerUpRight, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { deleteMessage, editMessage } from "@/app/chats/[chatId]/actions";
import { Textarea } from "./ui/textarea";

import {
  type UseImageSizeResult,
  getImageSize,
  useImageSize,
} from "react-image-size";
import { Skeleton } from "./ui/skeleton";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyRatio(
  width: number,
  height: number
): { width: number; height: number } {
  const divisor = gcd(width, height);
  return { width: width / divisor, height: height / divisor };
}

function scrollToReply(id: string | null) {
  if (!id) return;
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
    });
  }
}

export default function Message({
  userIsSender,
  chatData,
  messageData,
  onReply,
}: {
  userIsSender: boolean;
  chatData: {
    id: string;
  };
  messageData: {
    id: string;
    content: string;
    replyTo: {
      id: string;
      username: string;
    } | null;
    image: {
      url: string;
      width: number;
      height: number;
    } | null;
  };
  onReply: (messageId: string) => void;
}) {
  const [newMessage, setNewMessage] = useState(messageData.content);
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(
    messageData?.image ? true : false
  );
  const [drawerDeleteConfirm, setDrawerDeleteConfirm] = useState(false);

  return (
    <div
      className={`w-full flex flex-col hover:bg-black/60 focus:bg-black/60`}
      id={messageData.id}
    >
      <div
        className={`w-full flex flex-row group ${
          userIsSender ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`flex flex-col w-full gap-[2px] ${
            userIsSender ? "items-end" : "items-start"
          }`}
        >
          {messageData.replyTo && (
            <Button
              variant={"ghost"}
              onClick={() => scrollToReply(messageData.replyTo?.id ?? null)}
              className={`flex gap-2 text-muted-foreground p-1 px-2 h-fit w-fit ${
                userIsSender ? "flex-row" : "flex-row-reverse"
              }`}
            >
              <span>Replying to {messageData.replyTo.username}</span>
              {userIsSender ? <CornerUpLeft /> : <CornerUpRight />}
            </Button>
          )}
          <div
            className={`rounded-xl bg-background w-fit max-w-[95%] p-3 shadow-lg border border-border ${
              userIsSender ? "rounded-tr-sm" : "rounded-tl-sm"
            }`}
            tabIndex={1}
          >
            <p
              className="text-lg break-normal whitespace-normal"
              style={{ overflowWrap: "break-word" }}
            >
              {messageData.content}
            </p>
          </div>
          {messageData.image && (
            <div
              className="w-full h-full lg:max-w-[40%] md:max-w-[50%] max-w-[60%] relative rounded-lg overflow-hidden"
              style={{
                aspectRatio: `${messageData.image.width} / ${messageData.image.height}`,
              }}
            >
              {imageLoading && (
                <Skeleton className="w-full h-full absolute z-40" />
              )}
              <NextImage
                src={messageData.image.url}
                alt="balls"
                fill
                onLoad={() => setImageLoading(false)}
                sizes="(max-width: 768px) 80vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain"
              />
            </div>
          )}

          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  tabIndex={1}
                  className="px-1 h-fit w-fit focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <MoreHorizontal height={16} width={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => onReply(messageData.id)}>
                  <button className="w-full h-full text-start">Reply</button>
                </DropdownMenuItem>
                {userIsSender && (
                  <>
                    <DropdownMenuItem>
                      <DrawerTrigger
                        className="w-full h-full text-start"
                        onClick={() => setDrawerDeleteConfirm(false)}
                      >
                        Edit Message
                      </DrawerTrigger>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <DrawerTrigger
                        className="w-full h-full text-start"
                        onClick={() => setDrawerDeleteConfirm(true)}
                      >
                        Delete message
                      </DrawerTrigger>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {userIsSender && (
              <DrawerContent>
                {drawerDeleteConfirm ? (
                  <div className="w-full max-w-lg mx-auto">
                    <DrawerHeader>
                      <DrawerTitle>
                        Are you sure you want to delete?
                      </DrawerTitle>
                      <DrawerDescription>
                        Press confirm to permanently delete this message.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                      <form
                        action={deleteMessage.bind(
                          null,
                          messageData.id,
                          chatData.id
                        )}
                        onSubmit={() => setIsOpen(false)}
                      >
                        <Button
                          type="submit"
                          variant={"destructive"}
                          className="w-full"
                        >
                          Confirm
                        </Button>
                      </form>
                    </div>
                    <DrawerFooter className="w-full max-w-lg mx-auto">
                      <DrawerClose asChild>
                        <Button variant={"outline"}>Cancel</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                ) : (
                  <div className="w-full max-w-lg mx-auto">
                    <DrawerHeader>
                      <DrawerTitle>Edit Message</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                      <form
                        action={editMessage.bind(null, messageData.id)}
                        onSubmit={() => setIsOpen(false)}
                      >
                        <div className="flex flex-col w-full gap-4">
                          <Textarea
                            name="text"
                            className="resize-none h-36"
                            onChange={(e) => setNewMessage(e.target.value)}
                            value={newMessage}
                            required
                          />
                          <Button
                            type="submit"
                            variant={"secondary"}
                            className="w-full"
                          >
                            Edit
                          </Button>
                        </div>
                      </form>
                    </div>
                    <DrawerFooter className="w-full max-w-lg mx-auto">
                      <DrawerClose asChild>
                        <Button variant={"outline"}>Cancel</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                )}
              </DrawerContent>
            )}
          </Drawer>
        </div>
      </div>
    </div>
  );
}
