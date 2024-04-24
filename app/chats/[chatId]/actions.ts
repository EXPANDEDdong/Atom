"use server";

import { Message } from "@/utils/hooks";
import { createClient } from "@/utils/supabase/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { z } from "zod";
import { zfd } from "zod-form-data";
const isAnimated: (buffer: Buffer) => boolean = require("is-animated");
const sizeOf = require("buffer-image-size");

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
  image: zfd.file(z.instanceof(File).optional()),
});

export async function newChat<T extends boolean>(
  users: string[],
  formData: FormData
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const currentId = (await supabase.auth.getUser()).data.user?.id ?? null;

  if (!currentId) return null;

  let isGroup = false;

  if (users.length > 1) {
    isGroup = true;
  }

  const { data, error } = await supabase.rpc("create_chat", {
    participants: users,
    chat_is_group: isGroup,
  });

  if (error) {
    return null;
  }

  await newMessage(data, currentId, formData);

  return redirect(`/chats/${data}`);
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

  const { content, image } = parsedForm.data;

  let messageData: {
    chat_id: string;
    sender_id: string;
    content: string;
    image?: {
      url: string;
      width: number;
      height: number;
    };
  } = {
    chat_id: chatId,
    sender_id: currentUser,
    content: content,
  };

  if (image) {
    const imageForm = new FormData();
    imageForm.set("image", image);
    const imageLink = await compressAndUploadFile(imageForm, "messages");
    messageData = {
      ...messageData,
      image: imageLink,
    };
  }

  const { data, error } = await supabase
    .from("messages")
    .insert(messageData)
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

  await channel
    .send({
      type: "broadcast",
      event: "new-message",
      payload: data,
    })
    .then((response) => console.log(response));

  await supabase.removeChannel(channel);
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

  const { content, image } = parsedForm.data;

  let messageData: {
    chat_id: string;
    sender_id: string;
    content: string;
    image?: {
      url: string;
      width: number;
      height: number;
    };
  } = {
    chat_id: chatId,
    sender_id: currentUser,
    content: content,
  };

  if (image) {
    const imageForm = new FormData();
    imageForm.set("image", image);
    const imageLink = await compressAndUploadFile(imageForm, "messages");
    messageData = {
      ...messageData,
      image: imageLink,
    };
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      ...messageData,
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

  await channel
    .send({
      type: "broadcast",
      event: "new-message",
      payload: data,
    })
    .then((response) => console.log(response));

  await supabase.removeChannel(channel);
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

  await channel
    .send({
      type: "broadcast",
      event: "edit-message",
      payload: {
        message_id: data.message_id,
        new_text: data.content,
      },
    })
    .then((response) => console.log(response));

  await supabase.removeChannel(channel);
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

  await channel
    .send({
      type: "broadcast",
      event: "delete-message",
      payload: {
        message_id: messageId,
      },
    })
    .then((response) => console.log(response));

  await supabase.removeChannel(channel);
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

const imageFormSchema = zfd.formData({
  image: zfd.file(),
});

type FolderName = "posts" | "messages";

type ReturnType<T extends FolderName> = T extends "messages"
  ? { url: string; width: number; height: number }
  : string;

export async function compressAndUploadFile<T extends FolderName>(
  formData: FormData,
  folderName: T
): Promise<ReturnType<T>> {
  const parsedForm = imageFormSchema.safeParse(formData);
  if (!parsedForm.success) return Promise.reject("Error parsing image data.");
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const imageBuffer = Buffer.from(await parsedForm.data.image.arrayBuffer());
  console.time("animated");
  const animated = isAnimated(imageBuffer);
  console.timeEnd("animated");

  const image = sharp(imageBuffer, animated ? { animated: true } : undefined);

  const uniqueName = crypto.randomUUID();

  console.time("conversion");
  const finalImage = await image
    .webp({ quality: 40 })
    .toBuffer({ resolveWithObject: false });
  console.timeEnd("conversion");

  console.time("upload");
  const { data, error } = await supabase.storage
    .from("images")
    .upload(`${folderName}/${uniqueName}.webp`, finalImage, {
      contentType: "image/webp",
    });
  console.timeEnd("upload");

  if (error || !data.path) {
    return Promise.reject(error?.message || "Error uploading file.");
  }

  const imgURL = `${process.env
    .NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/object/public/images/${data.path}`;

  if (folderName === "messages") {
    const dimensions = sizeOf(finalImage);
    return {
      url: imgURL,
      width: dimensions.width,
      height: dimensions.height,
    } as ReturnType<T>;
  }

  return imgURL as ReturnType<T>;
}
