"use server";

import { cookies } from "next/headers";
import { createClient } from "./supabase/actions";
import crypto from "crypto";
import { zfd } from "zod-form-data";

const postSchema = zfd.formData({
  text: zfd.text(),
  images: zfd.repeatableOfType(zfd.text()).optional(),
});

export type PostSelectReturn = {
  id: string;
  text: string;
  created_at: string;
  has_images: boolean;
  images: string[] | null;
  profiles: {
    displayname: string | null;
    username: string;
    avatar_url: string | null;
    description: string | null;
  } | null;
  reply_to: {
    posts: {
      id: string;
    };
  }[];
  replies: {
    posts: { count: number };
  }[];
  userlike?: { count: number }[];
  userview?: { count: number }[];
  usersave?: { count: number }[];
  likecount: { count: number }[];
  viewcount: { count: number }[];
  savecount: { count: number }[];
}[];

const queryHasId: string = `
id,
text,
created_at,
has_images,
images,
profiles (
  displayname,
  username,
  avatar_url,
  description
  ),
reply_to:postreplies!reply_post_id(posts!post_id(id)),
replies:postreplies!post_id(posts!reply_post_id(count)),
userlike:likes!post_id(count),
userview:views!post_id(count),
usersave:saves!post_id(count),
likecount:likes(count),
viewcount:views(count),
savecount:saves(count)
`;

const queryNoId: string = `
id,
text,
created_at,
has_images,
images,
profiles (
  displayname,
  username,
  avatar_url,
  description
  ),
reply_to:postreplies!reply_post_id(posts!post_id(id)),
replies:postreplies!post_id(posts!reply_post_id(count)),
userlike:likes!post_id(),
userview:views!post_id(),
usersave:saves!post_id(),
likecount:likes(count),
viewcount:views(count),
savecount:saves(count)
`;

export async function getCurrentUser() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.log(error.message);
    console.log(error.cause);
  }

  return user?.id || null;
}

export async function getUserPageProfile(username: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
    id,
    displayname,
    description,
    avatar_url
    `
    )
    .eq("username", username);

  if (error) return null;

  const userData = data[0];

  if (
    !userData.id ||
    !userData.displayname ||
    !userData.description ||
    !userData.avatar_url
  )
    return null;

  return userData as {
    id: string;
    displayname: string;
    description: string;
    avatar_url: string;
  };
}

export async function getPosts(currentId: string | null, page: number) {
  const rangeStart = page * 10;
  const rangeEnd = rangeStart + 10;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let queryWithId = queryNoId;

  if (currentId) queryWithId = queryHasId;

  let query = supabase
    .from("posts")
    .select(queryWithId)
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeEnd);

  if (currentId) {
    query = query
      .eq("likes.user_id", currentId)
      .eq("views.user_id", currentId)
      .eq("saves.user_id", currentId);
  }
  const { data, error } = await query.returns<PostSelectReturn>();

  if (error) {
    return null;
  }
  const nextPage = data.length < 10 ? null : page + 1;
  const previousPage = page > 0 ? page - 1 : null;

  return { data: data, nextPage: nextPage, previousPage: previousPage };
}

export async function getUserPosts(
  userId: string,
  currentId: string | null,
  page: number
) {
  const rangeStart = page * 10;
  const rangeEnd = rangeStart + 10;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let queryWithId = queryNoId;

  if (currentId) queryWithId = queryHasId;

  let query = supabase
    .from("posts")
    .select(queryWithId)
    .order("created_at", { ascending: false })
    .eq("author_id", userId)
    .range(rangeStart, rangeEnd);

  if (currentId) {
    query = query
      .eq("likes.user_id", currentId)
      .eq("views.user_id", currentId)
      .eq("saves.user_id", currentId);
  }
  const { data, error } = await query.returns<PostSelectReturn>();

  if (error) {
    return null;
  }
  const nextPage = data.length < 10 ? null : page + 1;
  const previousPage = page > 0 ? page - 1 : null;

  return { data: data, nextPage: nextPage, previousPage: previousPage };
}

export async function likePost(hasLiked: boolean, postId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  if (!hasLiked) {
    return await supabase.from("likes").insert({ post_id: postId });
  }
  return await supabase.from("likes").delete().eq("post_id", postId);
}

export async function savePost(hasSaved: boolean, postId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  if (!hasSaved) {
    return await supabase.from("saves").insert({ post_id: postId });
  }
  return await supabase.from("saves").delete().eq("post_id", postId);
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

  const imgURL = `${process.env
    .NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/object/public/images/${data.path}`;
  return imgURL;
}

export async function newPost(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const result = postSchema.safeParse(formData);

  if (!result.success)
    return { success: false, message: "Error creating post." };

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
      embedding: embedding,
      ...postImageData,
    },
  ]);

  if (err.error) return { success: false, message: "Error creating post." };

  return { success: true, message: "Post created." };
}
