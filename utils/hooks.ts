"use client";

import { toast as sonner } from "sonner";
import { zfd } from "zod-form-data";
import { type Post, isAuthenticated, newPost, uploadFile } from "./actions";
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
//#region New post form
const newPostSchema = zfd.formData({
  text: zfd.text(),
  images: zfd.repeatableOfType(zfd.file(z.instanceof(File))).optional(),
});

async function handleNewPost<T extends boolean>(
  formData: FormData,
  isReply: T,
  replyToId: T extends true ? string : undefined
) {
  const isLoggedIn = await isAuthenticated(false);
  if (!isLoggedIn) {
    return "Not logged in.";
  }
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
            resolve(result);
          })
          .catch((err) => {
            reject(err);
          });
      });
    });

    const uploadImagesSuccess: boolean = await Promise.all(promises)
      .then((result) => {
        result.map((url) => newFormData.append("images", url));
        return true;
      })
      .catch((err) => {
        sonner("An error occured while handling image", {
          description: err,
        });
        return false;
      });

    if (!uploadImagesSuccess) {
      return Promise.reject("An error occured while handling image");
    }
  }

  const result = await newPost(newFormData, isReply, replyToId);
  if (!result.success) {
    sonner("An error occured while posting", {
      description: result.message,
    });
    return Promise.reject(new Error(result.message));
  }
  return result;
}

export function useAddPost(queryKey: string[], queryClient: QueryClient) {
  return useMutation({
    mutationFn: async ({
      newPost,
      formData,
      isReply,
      replyToId,
    }: {
      newPost: Post;
      formData: FormData;
      isReply: boolean;
      replyToId: string | null;
    }) => {
      return await handleNewPost(formData, isReply, replyToId ?? undefined);
    },
    onMutate: async ({ newPost }) => {
      await queryClient.cancelQueries({ queryKey: queryKey });

      const previousPosts = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(
        queryKey,
        (old: {
          pageParams: Array<{
            totalPage: number;
            recommendationIndex: number;
            pageOnIndex: number;
          }>;
          pages: Array<{
            data: Post[];
            newParameters: {
              newTotalPage: number;
              newRecommendationIndex: number;
              newPageOnIndex: number;
            };
          }>;
        }) => {
          return {
            ...old,
            pages: [
              {
                data: [newPost, ...old.pages[0].data],
                newParameters: old.pages[0].newParameters,
              },
              ...old.pages.slice(1), // Keep the rest of the pages unchanged
            ],
          };
        }
      );

      return { previousPosts };
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    mutationKey: ["addPost"],
  });
}
//#region Personal Messages
export type Message = {
  chat_id: string;
  content: string;
  image: string | null;
  message_id: string;
  sender_id: string;
  sent_at: string;
  reply_to: string | null;
};

export function useMessages(chatId: string, initialMessages: Message[]) {
  const [client] = useState(createClient());
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    if (chatId) {
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
            console.log("Subscribing to chat messages.");
          }
          if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
            sonner("Error while listening for messages.", {
              description: "Please reload the page to try again.",
            });
          }
        });
      return () => {
        client.removeChannel(channel);
      };
    }
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
            console.log("Subscribing to notifications.");
          }
          if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
            sonner("Error while listening for notifications.", {
              description: "Please reload the page to try again.",
            });
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
