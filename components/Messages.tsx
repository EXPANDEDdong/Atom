"use client";

import { type MessageUser } from "@/app/testing/actions";
import { Message as MessageType, useMessages } from "@/utils/hooks";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import Message from "./Message";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { newMessage, newReply } from "@/app/chats/[chatId]/actions";
import Link from "next/link";
import { ImagePlus, Send, X } from "lucide-react";
import { AspectRatio } from "./ui/aspect-ratio";

function isNewDayPassed(timestamp1: string, timestamp2?: string): boolean {
  const date1 = new Date(timestamp1);
  let date2: Date;

  if (!timestamp2) {
    return true;
  } else {
    date2 = new Date(timestamp2);
  }

  const timezoneOffset = new Date().getTimezoneOffset() * 60000;

  const localDate1 = new Date(date1.getTime() - timezoneOffset);
  const localDate2 = new Date(date2.getTime() - timezoneOffset);

  const year1 = localDate1.getFullYear();
  const month1 = localDate1.getMonth();
  const day1 = localDate1.getDate();

  const year2 = localDate2.getFullYear();
  const month2 = localDate2.getMonth();
  const day2 = localDate2.getDate();

  if (year1 !== year2 || month1 !== month2 || day1 !== day2) {
    return true;
  } else {
    return false;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

export default function Messages({
  chatId,
  initial,
  currentUser,
  participants,
}: {
  chatId: string;
  initial: MessageType[];
  currentUser: string;
  participants: Record<string, MessageUser>;
}) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const ref = useRef<HTMLFormElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const messages = useMessages(chatId, initial);

  let prevSenderId = "";
  let prevMessageSentAt = "";

  function setImage(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList) {
      setSelectedImage(null);
      return;
    }
    const image = fileList[0];

    setSelectedImage(image);
  }

  function removeImage() {
    setInputKey((prevKey) => prevKey + 1);
    setSelectedImage(null);
  }

  function scrollToMessage(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (messages) {
      timer = setTimeout(() => {
        const element = document.getElementById("bottom");
        if (element) {
          element.scrollIntoView({
            behavior: "instant",
          });
        }
        setInitialLoaded(true);
      }, 1500);
    }
    return () => {
      clearTimeout(timer);
    };
  });

  useEffect(() => {
    if (messages && initialLoaded) {
      scrollToMessage("bottom");
    }
  }, [messages, initialLoaded]);

  return (
    <div className="flex flex-col h-full gap-2">
      <ScrollArea className="w-full h-full">
        <div className="flex flex-col w-full p-4 mb-12">
          {messages.map((message, index) => {
            const isFirstMessageFromSender = message.sender_id !== prevSenderId;
            prevSenderId = message.sender_id;
            const isNewDay = isNewDayPassed(message.sent_at, prevMessageSentAt);
            prevMessageSentAt = message.sent_at;

            const replyingTo = message.reply_to
              ? {
                  id: message.reply_to,
                  username:
                    participants[
                      messages.find(
                        (msg) => msg.message_id === message.reply_to
                      )?.sender_id!
                    ].displayname,
                }
              : null;
            return (
              <Fragment key={index}>
                {isNewDay && (
                  <div className="flex flex-col w-full gap-2 py-2 h-fit">
                    <div className="flex flex-col items-center w-full h-fit">
                      <p>{formatDate(message.sent_at)}</p>
                    </div>
                    <Separator />
                  </div>
                )}
                {isFirstMessageFromSender && (
                  <div
                    className={`flex gap-2 items-center justify-end my-1 ${
                      message.sender_id === currentUser
                        ? "flex-row"
                        : "flex-row-reverse"
                    }`}
                  >
                    <h5 className="text-xl font-medium">
                      {participants[message.sender_id].displayname}
                    </h5>
                    <div className="relative flex w-12 h-12 overflow-hidden rounded-full">
                      <Image
                        src={participants[message.sender_id].avatar_url}
                        alt={`User avatar`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                <Message
                  userIsSender={message.sender_id === currentUser}
                  chatData={{
                    id: chatId,
                  }}
                  messageData={{
                    id: message.message_id,
                    replyTo: replyingTo,
                    content: message.content,
                    image: message.image,
                  }}
                  onReply={(messageId) => setReplyTo(messageId)}
                />
              </Fragment>
            );
          })}
          <div id="bottom"></div>
        </div>
      </ScrollArea>
      <div className="flex flex-col w-full gap-2">
        <Separator />
        {selectedImage && (
          <div className="flex flex-col gap-1">
            <div className="flex flex-row justify-start">
              <div className="w-40 h-40">
                <AspectRatio ratio={2 / 2} className="relative h-full">
                  <Button
                    variant={"outline"}
                    size={"icon"}
                    className="absolute z-30 top-1 right-1"
                    type="button"
                    onClick={removeImage}
                  >
                    <X />
                  </Button>
                  <Image
                    alt={selectedImage.name}
                    src={URL.createObjectURL(selectedImage)}
                    fill
                    className="absolute z-20 object-cover rounded-md"
                  />
                </AspectRatio>
              </div>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              Note: Images will be compressed to save bandwidth, this might be
              especially noticeable in animated images.
            </p>
          </div>
        )}
        {replyTo && (
          <div className="flex flex-row justify-between p-2 border rounded-md border-border bg-background">
            <Button variant={"ghost"} asChild>
              <Link href={`#${replyTo}`}>Replying to message</Link>
            </Button>
            <Button variant={"outline"} onClick={() => setReplyTo(null)}>
              <X />
            </Button>
          </div>
        )}
        {isSending && (
          <div className="flex flex-row justify-start p-2 border rounded-md border-border bg-background">
            <div className="flex flex-row gap-4">
              <svg
                className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
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
              <span>Message sending...</span>
            </div>
          </div>
        )}
        <form
          onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setIsSending(true);
            const formData = new FormData(e.target as HTMLFormElement);
            ref.current?.reset();
            if (!!replyTo) {
              await newReply(chatId, currentUser, replyTo, formData);
            } else {
              await newMessage(chatId, currentUser, formData);
            }
            setReplyTo(null);
            setSelectedImage(null);
            setIsSending(false);
          }}
          ref={ref}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            name="image"
            key={inputKey}
            onChange={setImage}
            ref={imageInputRef}
          />
          <div className="flex flex-row w-full gap-2 px-1">
            <Button
              variant={"outline"}
              size={"icon"}
              className="h-full w aspect-square"
              type="button"
              onClick={() => imageInputRef.current?.click()}
            >
              <ImagePlus />
            </Button>

            <div className="relative max-w-full grow">
              <Textarea
                name="content"
                placeholder="Enter your message..."
                required
                className="w-full pb-10 resize-none"
              />
              <Button
                type="submit"
                size={"icon"}
                className="absolute bottom-2 right-2 z-30"
                disabled={isSending}
              >
                <Send />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
