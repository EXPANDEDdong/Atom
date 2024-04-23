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
import { use, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "./supabase/client";
import { produce } from "immer";
import { SessionContext } from "@/app/UserContext";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  type Notification,
  fetchNotifications,
} from "@/app/user/[username]/actions";
import { compressAndUploadFile } from "@/app/chats/[chatId]/actions";
//#region New post form
const newPostSchema = zfd.formData({
  text: zfd.text(),
  images: zfd.repeatableOfType(zfd.file(z.instanceof(File))).optional(),
});

async function handleNewPost<T extends boolean>(
  formData: FormData,
  isReply: T,
  replyToId: T extends true ? string : undefined,
  currentUser: string | null
) {
  const postSonner = sonner.loading("Creating new post...");
  if (!currentUser) {
    sonner.error("You are not logged in", {
      id: postSonner,
      duration: 4000,
    });
    return Promise.reject(new Error("Not logged in."));
  }
  const postData = newPostSchema.safeParse(formData);
  if (!postData.success) {
    sonner.error("Invalid post format.", {
      id: postSonner,
      duration: 4000,
    });
    return Promise.reject(new Error("Invalid post data."));
  }

  const newFormData = new FormData();
  newFormData.set("text", postData.data.text);

  if (postData.data.images) {
    const promises = postData.data.images.map((file) => {
      return new Promise((resolve: (value: string) => any, reject) => {
        const fileFormData = new FormData();
        fileFormData.set("image", file);
        compressAndUploadFile(fileFormData, "posts")
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
        sonner("An error occurred while handling image", {
          description: err,
          closeButton: true,
        });
        return false;
      });

    if (!uploadImagesSuccess) {
      sonner.error("Failed to upload images.", {
        id: postSonner,
        duration: 4000,
      });
      return Promise.reject(
        new Error("An error occurred while handling image")
      );
    }
  }

  const result = await newPost(newFormData, isReply, replyToId);
  if (!result.success) {
    sonner.error("An error occurred while posting", {
      id: postSonner,
      description: result.message,
      duration: 5000,
    });
    return Promise.reject(new Error(result.message));
  }
  sonner.success("Post created successfully.", {
    id: postSonner,
    duration: 4000,
  });
  return result;
}

export function useAddPost(queryKey: string[], queryClient: QueryClient) {
  const currentUser = use(SessionContext);
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
      return await handleNewPost(
        formData,
        isReply,
        replyToId ?? undefined,
        currentUser?.id ?? null
      );
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
              ...old.pages.slice(1),
            ],
          };
        }
      );

      return { previousPosts };
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onSuccess: (res) => {
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
                data: [
                  {
                    ...old.pages[0].data[0],
                    id: res.message,
                  },
                  ...old.pages[0].data.slice(1),
                ],
                newParameters: old.pages[0].newParameters,
              },
              ...old.pages.slice(1),
            ],
          };
        }
      );
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
  const lastStatus = useRef<
    "SUBSCRIBED" | "TIMED_OUT" | "CLOSED" | "CHANNEL_ERROR" | null
  >(null);

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
            if (lastStatus.current === null) {
              sonner.info("Listening for messages", {
                duration: 2000,
                dismissible: true,
              });
            }
            if (
              lastStatus.current === "CHANNEL_ERROR" ||
              lastStatus.current === "TIMED_OUT"
            ) {
              sonner.info("Reconnected to messages listener.", {
                duration: 2000,
                dismissible: true,
              });
            }
          }
          if (status === "CHANNEL_ERROR") {
            sonner.error("Error while listening for messages.", {
              duration: 4000,
              dismissible: true,
            });
          }
          lastStatus.current = status;
        });
      return () => {
        client.removeChannel(channel);
      };
    }
  }, [messages, client, chatId]);

  return messages;
}
//#region Notifications
export function useNotifications() {
  const [client] = useState(createClient());
  const [unreadCount, setUnread] = useState<number>(0);
  const [notifications, setNotifs] = useState<Notification[]>([]);
  const user = useContext(SessionContext);
  const lastStatus = useRef<
    "SUBSCRIBED" | "TIMED_OUT" | "CLOSED" | "CHANNEL_ERROR" | null
  >(null);

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
            if (lastStatus.current === null) {
              sonner.info("Listening for notifications", {
                duration: 2000,
                dismissible: true,
              });
            }
            if (
              lastStatus.current === "CHANNEL_ERROR" ||
              lastStatus.current === "TIMED_OUT"
            ) {
              sonner.info("Reconnected to notifications listener.", {
                duration: 2000,
                dismissible: true,
              });
            }
          }
          if (status === "CHANNEL_ERROR") {
            sonner.error("Error while listening for notifications.", {
              duration: 4000,
              dismissible: true,
            });
          }
          lastStatus.current = status;
        });
    }

    return () => {
      if (channel) {
        client.removeChannel(channel);
      }
    };
  }, [client, user]);

  return { unreadCount, notifications, setUnread };
}
