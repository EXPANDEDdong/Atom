"use server";

import ChatList from "@/components/ChatList";
import { getCurrentUser } from "@/utils/actions";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getChats } from "./[chatId]/actions";
import { redirect } from "next/navigation";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentId = await getCurrentUser();

  console.log(currentId);

  // if (!currentId) return redirect("/login");

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["chats"],
    queryFn: async () => getChats(currentId!),
  });
  return (
    <div
      className="flex flex-row-reverse gap-2 fixed w-full"
      style={{ height: "calc(100% - 4rem)" }}
    >
      {children}
      <div className="p-2 flex-grow-0 w-3/6 max-w-[40rem] only:max-w-full only:w-full rounded-lg border border-border h-full peer-first:hidden md:peer-first:block">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ChatList currentUser={currentId!} />
        </HydrationBoundary>
      </div>
    </div>
  );
}
