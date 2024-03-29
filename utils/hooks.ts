"use client";

import { zfd } from "zod-form-data";
import {
  PostSelectReturn,
  isAuthenticated,
  newPost,
  uploadFile,
} from "./actions";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { z } from "zod";
import { useContext, useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import { produce } from "immer";
import { SessionContext } from "@/app/UserContext";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  type Notification,
  fetchNotifications,
} from "@/app/user/[username]/actions";

const newPostSchema = zfd.formData({
  text: zfd.text(),
  images: zfd.repeatableOfType(zfd.file(z.instanceof(File))).optional(),
});

async function handleNewPost<T extends boolean>(
  formData: FormData,
  isReply: T,
  replyToId: T extends true ? string : undefined
) {
  console.log("1");
  const isLoggedIn = await isAuthenticated(false);
  console.log(isLoggedIn);
  if (!isLoggedIn) {
    return "Not logged in.";
  }
  console.time("post");
  const postData = newPostSchema.safeParse(formData);
  if (!postData.success) return;

  const newFormData = new FormData();
  newFormData.set("text", postData.data.text);

  if (postData.data.images) {
    const promises = postData.data.images.map((file, i) => {
      return new Promise((resolve: (value: string) => any, reject) => {
        const fileFormData = new FormData();
        fileFormData.set("image", file);
        uploadFile(fileFormData)
          .then((result) => {
            console.timeLog("post", `File ${i + 1} done.`);
            resolve(result);
          })
          .catch((err) => {
            reject(err);
          });
      });
    });

    console.timeLog("post", "Start promises.");

    const uploadImagesSuccess: boolean = await Promise.all(promises)
      .then((result) => {
        result.map((url) => newFormData.append("images", url));
        return true;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });

    if (!uploadImagesSuccess) {
      console.timeLog("post", "One or more promises rejected.");
      console.timeEnd("post");
      return "Failed images upload.";
    }
    console.timeLog("post", "All promises finished.");
  }

  const result = await newPost(newFormData, isReply, replyToId);
  console.log(result);
  console.timeLog("post", "Posted.");
  console.timeEnd("post");
  return result;
}

export function useAddPost(queryKey: string, queryClient: QueryClient) {
  return useMutation({
    mutationFn: async ({
      newPost,
      formData,
      isReply,
      replyToId,
    }: {
      newPost: PostSelectReturn[number];
      formData: FormData;
      isReply: boolean;
      replyToId: string | null;
    }) => {
      return await handleNewPost(formData, isReply, replyToId ?? undefined);
    },
    onMutate: async ({ newPost }) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] });

      const previousPosts = queryClient.getQueryData([queryKey]);

      queryClient.setQueryData(
        [queryKey],
        (old: {
          pageParams: Array<number>;
          pages: Array<{
            data: PostSelectReturn;
            nextPage: number;
            previousPage: number;
          }>;
        }) => {
          return {
            ...old,
            pages: [
              {
                data: [newPost, ...old.pages[0].data],
                nextPage: old.pages[0].nextPage,
                previousPage: old.pages[0].previousPage,
              },
              ...old.pages.slice(1), // Keep the rest of the pages unchanged
            ],
          };
        }
      );

      return { previousPosts };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    mutationKey: ["addPost"],
  });
}

export type Message = {
  chat_id: string;
  content: string;
  image: string | null;
  message_id: string;
  sender_id: string;
  sent_at: string;
  reply_to: string | null;
};

export function useMessagesRQ(chatId: string, queryClient: QueryClient) {
  const [client] = useState(createClient());
  const { mutate } = useMutation({
    mutationFn: async (message: Message) =>
      await new Promise((resolve) => resolve("sent")),
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ["chat", chatId] });

      queryClient.setQueryData(["chat", chatId], (old: Message[]) => {
        return [...old, newMessage];
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
    },
    mutationKey: ["addMessage"],
  });

  useEffect(() => {
    const channel = client
      .channel(`Chat-${chatId}`)
      .on(
        "broadcast",
        {
          event: "new-message",
        },
        (payload) => {
          mutate(payload.payload as Message);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("joined");
        }
      });
    return () => {
      client.removeChannel(channel);
    };
  }, [client, chatId, mutate]);
}

export function useMessages(chatId: string, initialMessages: Message[]) {
  const [client] = useState(createClient());
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    const channel = client
      .channel(`Chat-${chatId}`)
      .on(
        "broadcast",
        {
          event: "new-message",
        },
        (payload) => {
          setMessages([...messages, payload.payload as Message]);
        }
      )
      .on(
        "broadcast",
        {
          event: "edit-message",
        },
        (payload) => {
          setMessages((prevMessages) =>
            produce(prevMessages, (draft) => {
              const editedMessageIndex = draft.findIndex(
                (message) => message.message_id === payload.payload.message_id
              );
              if (editedMessageIndex !== -1) {
                draft[editedMessageIndex].content = payload.payload.new_text;
              }
            })
          );
        }
      )
      .on(
        "broadcast",
        {
          event: "delete-message",
        },
        (payload) => {
          setMessages((prevMessages) =>
            produce(prevMessages, (draft) => {
              const index = draft.findIndex(
                (message) => message.message_id === payload.payload.message_id
              );
              if (index !== -1) {
                draft.splice(index, 1);
              }
            })
          );
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("joined");
        }
      });
    return () => {
      client.removeChannel(channel);
    };
  }, [messages, client, chatId]);

  return messages;
}

export function useNotifications() {
  const [client] = useState(createClient());
  const [unreadCount, setUnread] = useState<number>(0);
  const [notifications, setNotifs] = useState<Notification[]>([]);
  const user = useContext(SessionContext);

  useEffect(() => {
    const fetchInitialNotifications = async () => {
      if (user) {
        const fetchedNotifications = await fetchNotifications();
        setUnread(fetchedNotifications.unreadCount);
        setNotifs(fetchedNotifications.notifications);
      }
    };

    fetchInitialNotifications();

    let channel: RealtimeChannel;

    if (user) {
      channel = client
        .channel(`Notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifs((prev) => [payload.new as any, ...prev]);
            setUnread((prev) => (prev += 1));
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("notifications joined");
          }
        });
    }

    return () => {
      if (channel) {
        client.removeChannel(channel);
      }
    };
  }, [client, user]);

  return { unreadCount, notifications };
}
