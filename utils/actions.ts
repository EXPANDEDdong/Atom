"use server";

import { cookies } from "next/headers";
import { createClient } from "./supabase/actions";
import crypto from "crypto";
import { zfd } from "zod-form-data";

const postSchema = zfd.formData({
  text: zfd.text(),
  images: zfd.repeatableOfType(zfd.text()).optional(),
});

export async function testEmbedding(text: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase.functions.invoke("embedding", {
    body: { input: text },
  });

  console.log(data);
  return;
}

const imageFormSchema = zfd.formData({
  image: zfd.file(),
});

export async function isAuthenticated() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return false;
  }
  return true;
}

export async function uploadFile(formData: FormData) {
  const parsedForm = imageFormSchema.safeParse(formData);
  if (!parsedForm.success) return "Error.";
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const uniqueName = crypto.randomUUID();

  const { data, error } = await supabase.storage
    .from("images")
    .upload(`posts/${uniqueName}`, parsedForm.data.image);

  if (error || !data.path) {
    return Promise.reject(error?.message || "Error uploading file.");
  }
  return data.path;
}

export async function newPost(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const result = postSchema.safeParse(formData);

  if (!result.success)
    return { success: false, message: "Error creating post." };

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { success: false, message: "Error fetching user for post." };
  }

  const { data } = await supabase.functions.invoke<{ embedding: number[] }>(
    "embedding",
    {
      body: { input: result.data.text },
    }
  );

  if (!data)
    return { success: false, message: "Error creating post embedding." };

  const { embedding } = data;

  let postImageData: { has_images?: boolean; images?: string[] } = {};

  if (result.data.images && result.data.images.length > 0) {
    postImageData = {
      ...postImageData,
      has_images: true,
      images: result.data.images,
    };
  }

  const err = await supabase.from("posts").insert([
    {
      text: result.data.text,
      author_id: user.id,
      embedding: embedding,
      ...postImageData,
    },
  ]);

  if (err.error) return { success: false, message: "Error creating post." };

  return { success: true, message: "Post created." };
}
