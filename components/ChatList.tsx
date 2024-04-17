"use client";

import { getChats } from "@/app/chats/[chatId]/actions";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import NewChatButton from "./NewChatButton";

function concatUsers(
  users: {
    profiles: {
      username: string;
      displayname: string | null;
      avatar_url: string | null;
    } | null;
  }[]
) {
  const allUsers = users.map((user) => user.profiles!.displayname!);
  return allUsers.join(", ");
}

export default function ChatList({ currentUser }: { currentUser: string }) {
  const { data } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => getChats(currentUser),
  });

  return (
    <ScrollArea className="w-full h-full">
      <div className="flex flex-col w-full gap-4">
        {/* <NewChatButton /> */}
        {data?.map((chat, i) => {
          const chatLink = `/chats/${chat.chat_id}`;
          const chatUsers =
            chat.chatparticipants.length === 1 || !chat.is_group
              ? chat.chatparticipants[0].profiles!.displayname!
              : concatUsers(chat.chatparticipants);

          return (
            <Button
              key={i}
              variant={"ghost"}
              className="flex flex-row justify-start w-full max-w-full gap-4 p-4 h-fit"
              asChild
            >
              <Link href={chatLink}>
                <div className="relative w-8 h-8 overflow-hidden rounded-full">
                  <Image
                    src={
                      chat.chatparticipants[0].profiles?.avatar_url ??
                      "https://wjucegfkshgallheqlzz.supabase.co/storage/v1/object/public/images/avatars/no-profile-picture-icon.webp"
                    }
                    alt="profile picture"
                    fill
                    className="absolute z-10 object-cover h-full"
                  />
                </div>
                <div className="flex flex-col justify-start gap-2">
                  <div className="text-lg font-medium leading-none">
                    {chatUsers}
                  </div>
                  <p className="text-base leading-snug line-clamp-2 text-muted-foreground">
                    {`${chat.messages[0].profiles?.displayname}: ${chat.messages[0].content}`.slice(
                      0,
                      50
                    ) + "..."}
                  </p>
                </div>
              </Link>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
