"use server";
import Messages from "@/components/Messages";
import { MessageUser, getChat } from "./actions";
import { getCurrentUser } from "@/utils/actions";
import { redirect } from "next/navigation";
import NewMessageForm from "@/components/NewMessageForm";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default async function page({ params }: { params: { chatId: string } }) {
  const currentUser = await getCurrentUser();

  console.log(currentUser);

  if (!currentUser) return redirect("/login");

  const chatData = await getChat(params.chatId);

  const initialMessages = chatData.messages;

  const participants: Record<string, MessageUser> = {};

  chatData.chatparticipants.forEach((user) => {
    if (user.profiles) {
      if (!(user.profiles.id in participants)) {
        participants[user.profiles.id] = {
          id: user.profiles.id,
          username: user.profiles.username,
          displayname: user.profiles.displayname ?? user.profiles.username,
          avatar_url:
            user.profiles.avatar_url ??
            "https://wjucegfkshgallheqlzz.supabase.co/storage/v1/object/public/images/avatars/no-profile-picture-icon.webp",
        };
      }
    }
  });

  return (
    <main className="w-full h-full flex-grow flex flex-col gap-2 relative peer">
      <div className="w-full h-full">
        <Messages
          chatId={params.chatId}
          initial={initialMessages}
          currentUser={currentUser!}
          participants={participants}
        />
      </div>
      {/* <div className="w-full absolute p-2 bottom-0">
        <NewMessageForm chatId={params.chatId} currentUser={currentUser} />
      </div> */}
    </main>
  );
}
