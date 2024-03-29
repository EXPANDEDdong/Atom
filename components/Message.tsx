"use client";
import NextImage from "next/image";
import { useEffect, useState } from "react";
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
import Link from "next/link";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyRatio(width: number, height: number): [number, number] {
  const divisor = gcd(width, height);
  return [width / divisor, height / divisor];
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
    image: string | null;
  };
  onReply: (messageId: string) => void;
}) {
  const [{ width, height }, setImageRatio] = useState({ width: 0, height: 0 });
  const [newMessage, setNewMessage] = useState(messageData.content);
  const [isOpen, setIsOpen] = useState(false);
  const [drawerDeleteConfirm, setDrawerDeleteConfirm] = useState(false);

  useEffect(() => {
    const getImageSize = async () => {
      if (!messageData.image) return;
      const image = new Image();
      image.src = messageData.image;
      await image.decode();
      const [imageWidth, imageHeight] = simplifyRatio(
        image.width,
        image.height
      );
      setImageRatio({ width: imageWidth, height: imageHeight });
    };

    getImageSize();
  }, [messageData.image]);
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
              asChild
              className={`flex gap-2 text-muted-foreground p-1 px-2 h-fit w-fit ${
                userIsSender ? "flex-row" : "flex-row-reverse"
              }`}
            >
              <Link href={`#${messageData.replyTo.id}`}>
                <span>Replying to {messageData.replyTo.username}</span>
                {userIsSender ? <CornerUpLeft /> : <CornerUpRight />}
              </Link>
            </Button>
          )}
          <div
            className={`rounded-xl bg-background w-fit max-w-[95%] p-3 shadow-lg border border-border ${
              userIsSender ? "rounded-tr-sm" : "rounded-tl-sm"
            }`}
            tabIndex={1}
          >
            <p
              className="whitespace-normal text-lg break-normal"
              style={{ overflowWrap: "break-word" }}
            >
              {messageData.content}
            </p>
          </div>
          {messageData.image && (
            <div
              className="w-full h-full max-w-[40%] relative rounded-lg overflow-hidden"
              style={{ aspectRatio: `${width} / ${height}` }}
            >
              <NextImage
                src={messageData.image}
                alt="balls"
                fill
                className="object-contain"
              />
            </div>
          )}
          {userIsSender && (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    tabIndex={1}
                    className="h-fit w-fit px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    <MoreHorizontal height={16} width={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem onClick={() => onReply(messageData.id)}>
                    <button className="w-full h-full text-start">Reply</button>
                  </DropdownMenuItem>
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
                </DropdownMenuContent>
              </DropdownMenu>
              <DrawerContent>
                {drawerDeleteConfirm ? (
                  <div className="mx-auto w-full max-w-lg">
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
                    <DrawerFooter className="mx-auto w-full max-w-lg">
                      <DrawerClose asChild>
                        <Button variant={"outline"}>Cancel</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                ) : (
                  <div className="mx-auto w-full max-w-lg">
                    <DrawerHeader>
                      <DrawerTitle>Edit Message</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                      <form
                        action={editMessage.bind(null, messageData.id)}
                        onSubmit={() => setIsOpen(false)}
                      >
                        <div className="w-full flex flex-col gap-4">
                          <Textarea
                            name="text"
                            className="h-36 resize-none"
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
                    <DrawerFooter className="mx-auto w-full max-w-lg">
                      <DrawerClose asChild>
                        <Button variant={"outline"}>Cancel</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                )}
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>
    </div>
  );
}
