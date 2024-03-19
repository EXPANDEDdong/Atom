"use client";

import { MessageUser, newMessage } from "@/app/testing/actions";
import { Message, useMessages } from "@/utils/hooks";
import { Card, CardContent, CardHeader } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import { Fragment } from "react";

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
  initial: Message[];
  currentUser: string;
  participants: Record<string, MessageUser>;
}) {
  const messages = useMessages(chatId, initial);
  let prevSenderId = "";
  let prevMessageSentAt = "";

  return (
    <>
      <div className="flex flex-col w-full gap-2">
        {messages.map((message, index) => {
          const isFirstMessageFromSender = message.sender_id !== prevSenderId;
          prevSenderId = message.sender_id;
          const isNewDay = isNewDayPassed(message.sent_at, prevMessageSentAt);
          prevMessageSentAt = message.sent_at;
          return (
            <Fragment key={index}>
              {isNewDay && (
                <div className="w-full flex flex-col h-fit items-center">
                  <p>{formatDate(message.sent_at)}</p>
                </div>
              )}
              {isFirstMessageFromSender && (
                <div
                  className={`flex gap-2 items-center justify-end ${
                    message.sender_id === currentUser
                      ? "flex-row"
                      : "flex-row-reverse"
                  }`}
                >
                  <h5 className="text-xl font-medium">
                    {participants[message.sender_id].displayname}
                  </h5>
                  <div className="relative flex h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={participants[message.sender_id].avatar_url}
                      alt={`User avatar`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              <div className={`w-full flex flex-col`}>
                <div
                  className={`w-full flex flex-col gap-[2px] ${
                    message.sender_id === currentUser
                      ? "items-end"
                      : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-xl w-fit max-w-[95%] p-3 ${
                      message.sender_id === currentUser
                        ? "rounded-tr-sm bg-sky-500 text-neutral-900 border-none"
                        : "rounded-tl-sm border border-border"
                    }`}
                  >
                    <p className="whitespace-normal text-lg">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </>
  );
}
