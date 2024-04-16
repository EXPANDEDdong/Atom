"use server";

import { Message } from "@/utils/hooks";
import { createClient } from "@/utils/supabase/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { zfd } from "zod-form-data";

export type MessageUser = {
  id: string;
  username: string;
  displayname: string;
  avatar_url: string;
};

type NewChatUsers<T extends boolean> = T extends true
  ? readonly [string, string, string?, string?, string?]
  : readonly [string];

const newMessageSchema = zfd.formData({
  content: zfd.text(),
});

export async function newChat<T extends boolean>(
  currentId: string,
  isGroup: T,
  users: NewChatUsers<T>,
  formData: FormData
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error: err } = await supabase
    .from("chats")
    .insert({ is_group: isGroup })
    .select("chat_id")
    .maybeSingle();

  if (!data || err) {
    return null;
  }

  const newParticipants = users
    .map((user) => {
      if (!user) {
        return undefined;
      }
      return { chat_id: data.chat_id, user_id: user };
    })
    .filter(
      (participant): participant is { chat_id: string; user_id: string } =>
        participant !== undefined
    );

  const { error } = await supabase
    .from("chatparticipants")
    .insert([
      { chat_id: data.chat_id, user_id: currentId },
      ...newParticipants,
    ]);

  await newMessage(data.chat_id, currentId, formData);

  if (error) {
    return null;
  }
  return redirect(`/testing/chats/${data.chat_id}`);
}

type ChatData = {
  chat_id: string;
  is_group: boolean;
  chatparticipants: {
    profiles: {
      id: string;
      username: string;
      displayname: string | null;
      avatar_url: string | null;
    } | null;
  }[];
  messages: Message[];
};

export async function getChat(chatId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from("chats")
    .select(
      `
  chat_id,
  is_group,
  chatparticipants (
    profiles (
      id,
      username,
      displayname,
      avatar_url
    )
  ),
  messages (
    message_id,
    sent_at,
    sender_id,
    chat_id,
    content,
    image,
    reply_to
  )
  `
    )
    .eq("chat_id", chatId)
    .order("sent_at", { referencedTable: "messages" })
    .returns<ChatData[]>()
    .maybeSingle();

  return data!;
}

export async function newMessage(
  chatId: string,
  currentUser: string,
  formData: FormData
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const parsedForm = newMessageSchema.safeParse(formData);

  if (!parsedForm.success) return null;

  const { content } = parsedForm.data;

  const { data, error } = await supabase
    .from("messages")
    .insert({ chat_id: chatId, sender_id: currentUser, content })
    .select()
    .maybeSingle();

  if (error || !data) return null;

  const channel = supabase.channel(`Chat-${chatId}`, {
    config: {
      broadcast: {
        self: true,
        ack: true,
      },
    },
  });

  channel
    .send({
      type: "broadcast",
      event: "new-message",
      payload: data,
    })
    .then((response) => console.log(response));

  supabase.removeChannel(channel);
}

export async function newReply(
  chatId: string,
  currentUser: string,
  messageId: string,
  formData: FormData
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const parsedForm = newMessageSchema.safeParse(formData);

  if (!parsedForm.success) return null;

  const { content } = parsedForm.data;

  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      sender_id: currentUser,
      content,
      reply_to: messageId,
    })
    .select()
    .maybeSingle();

  if (error || !data) return null;

  const channel = supabase.channel(`Chat-${chatId}`, {
    config: {
      broadcast: {
        self: true,
        ack: true,
      },
    },
  });

  channel
    .send({
      type: "broadcast",
      event: "new-message",
      payload: data,
    })
    .then((response) => console.log(response));

  supabase.removeChannel(channel);
}

const editMessageSchema = zfd.formData({
  text: zfd.text(),
});

export async function editMessage(messageId: string, formData: FormData) {
  const parsedForm = editMessageSchema.safeParse(formData);

  if (!parsedForm.success) return null;

  const { text } = parsedForm.data;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("messages")
    .update({ content: text })
    .eq("message_id", messageId)
    .select("message_id, chat_id, content")
    .maybeSingle();

  if (error || !data) return null;

  const channel = supabase.channel(`Chat-${data.chat_id}`, {
    config: {
      broadcast: {
        self: true,
        ack: true,
      },
    },
  });

  channel
    .send({
      type: "broadcast",
      event: "edit-message",
      payload: {
        message_id: data.message_id,
        new_text: data.content,
      },
    })
    .then((response) => console.log(response));

  supabase.removeChannel(channel);
}

export async function deleteMessage(messageId: string, chatId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("message_id", messageId);

  console.log(error);

  if (error) return null;

  const channel = supabase.channel(`Chat-${chatId}`, {
    config: {
      broadcast: {
        self: true,
        ack: true,
      },
    },
  });

  channel
    .send({
      type: "broadcast",
      event: "delete-message",
      payload: {
        message_id: messageId,
      },
    })
    .then((response) => console.log(response));

  supabase.removeChannel(channel);
}

export async function getChats(currentUser: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("chats")
    .select(
      `
  chat_id,
  is_group,
  chatparticipants (
    profiles (
      username,
      displayname,
      avatar_url
    )
  ),
  messages (
    content,
    sent_at,
    profiles (
      displayname
    )
  )
  `
    )
    .order("sent_at", { referencedTable: "messages", ascending: false })
    .limit(1, { referencedTable: "messages" })
    .neq("chatparticipants.user_id", currentUser);

  if (!data) return null;

  return data;
}
