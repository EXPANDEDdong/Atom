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
import { X } from "lucide-react";
import { toast } from "sonner";

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
  const ref = useRef<HTMLFormElement>(null);

  const messages = useMessages(chatId, initial);
  let prevSenderId = "";
  let prevMessageSentAt = "";

  function scrollToMessage(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
  }

  useEffect(() => {
    if (initial) {
      const timer = setTimeout(
        () => scrollToMessage(initial[initial.length - 1].message_id),
        1000
      );

      return () => {
        clearTimeout(timer);
      };
    }
  }, [initial]);

  return (
    <>
      <ScrollArea className="w-full h-full">
        <div className="flex flex-col w-full p-4 mb-16">
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
        </div>
      </ScrollArea>
      <div className="absolute bottom-0 flex flex-col w-full gap-2 p-2">
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
        <form
          onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            ref.current?.reset();
            if (!!replyTo) {
              await newReply(chatId, currentUser, replyTo, formData);
              return;
            }
            const response = await newMessage(chatId, currentUser, formData);
            console.log(response);
          }}
          ref={ref}
        >
          <div className="flex flex-row w-full gap-2">
            <Textarea
              name="content"
              placeholder="Enter your message..."
              required
              className="resize-none grow"
            />
            <Button type="submit" className="h-20 grow-0">
              Send
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
