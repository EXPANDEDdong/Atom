"use client";

import { getChats } from "@/app/chats/[chatId]/actions";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

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
      <div className="w-full flex flex-col gap-4">
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
              className="flex flex-row gap-4 p-4 h-fit justify-start w-full"
              asChild
            >
              <Link href={chatLink}>
                <div className="h-8 w-8 relative overflow-hidden rounded-full">
                  <Image
                    src={
                      chat.chatparticipants[0].profiles?.avatar_url ??
                      "https://wjucegfkshgallheqlzz.supabase.co/storage/v1/object/public/images/avatars/no-profile-picture-icon.webp"
                    }
                    alt="profile picture"
                    fill
                    className="h-full object-cover absolute z-10"
                  />
                </div>
                <div className="flex flex-col gap-2 justify-start">
                  <div className="text-lg font-medium leading-none">
                    {chatUsers}
                  </div>
                  <p className="line-clamp-2 text-base leading-snug text-muted-foreground">
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
