"use server";

import { cookies } from "next/headers";
import { createClient } from "./supabase/actions";
import crypto from "crypto";
import { zfd } from "zod-form-data";
import { initializeEmbeddingPipeline } from "@/server/embeddingPipeline";

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
profiles!public_posts_author_id_fkey (
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
profiles!public_posts_author_id_fkey (
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

const queryRepliesHasId: string = `
id,
text,
created_at,
has_images,
images,
profiles!public_posts_author_id_fkey (
  displayname,
  username,
  avatar_url,
  description
  ),
reply_to:postreplies!reply_post_id!inner(posts!post_id(id)),
replies:postreplies!post_id(posts!reply_post_id(count)),
userlike:likes!post_id(count),
userview:views!post_id(count),
usersave:saves!post_id(count),
likecount:likes(count),
viewcount:views(count),
savecount:saves(count)
`;

const queryRepliesNoId: string = `
id,
text,
created_at,
has_images,
images,
profiles!public_posts_author_id_fkey (
  displayname,
  username,
  avatar_url,
  description
  ),
  reply_to:postreplies!reply_post_id!inner(posts!post_id(id)),
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

export type FetchParameters<T extends "all" | "user" | "replies"> =
  T extends "all"
    ? {
        type: T;
        postId?: T extends "replies" ? string : undefined;
        userId?: T extends "user" ? string : undefined;
        imagesOnly?: T extends "user" ? boolean : false;
      }
    : T extends "user"
    ? {
        type: T;
        postId?: T extends "replies" ? string : undefined;
        userId: T extends "user" ? string : undefined;
        imagesOnly: T extends "user" ? boolean : false;
      }
    : T extends "replies"
    ? {
        type: T;
        postId: T extends "replies" ? string : undefined;
        userId?: T extends "user" ? string : undefined;
        imagesOnly?: T extends "user" ? boolean : false;
      }
    : unknown;

export async function getPosts<T extends "all" | "user" | "replies">(
  { type, userId, postId, imagesOnly }: FetchParameters<T>,
  currentId: string | null,
  page: number
): Promise<{
  data: PostSelectReturn;
  nextPage: number | null;
  previousPage: number | null;
} | null> {
  console.time("fetching");
  const rangeStart = page * 10;
  const rangeEnd = rangeStart + 10;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  switch (type) {
    case "all": {
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
      console.timeEnd("fetching");
      return { data: data, nextPage: nextPage, previousPage: previousPage };
    }
    case "user": {
      let queryWithId = queryNoId;

      if (currentId) queryWithId = queryHasId;

      let query = supabase
        .from("posts")
        .select(queryWithId)
        .order("created_at", { ascending: false })
        .range(rangeStart, rangeEnd)
        .eq("author_id", userId);

      if (imagesOnly) {
        query = query.eq("has_images", true);
      }

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
      console.timeEnd("fetching");
      return { data: data, nextPage: nextPage, previousPage: previousPage };
    }
    case "replies": {
      let queryWithId = queryRepliesNoId;

      if (currentId) queryWithId = queryRepliesHasId;

      let query = supabase
        .from("posts")
        .select(queryWithId)
        .order("created_at", { ascending: false })
        .eq("postreplies.post_id", postId)
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
      console.timeEnd("fetching");
      return { data: data, nextPage: nextPage, previousPage: previousPage };
    }
  }
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

export type ProfileType = {
  id: string;
  username: string;
  displayname: string | null;
  description: string | null;
  avatar_url: string | null;
} | null;

export async function isAuthenticated<T extends boolean>(
  returnUser: T
): Promise<T extends true ? ProfileType : boolean> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return (returnUser === true ? null : false) as T extends true
      ? ProfileType
      : boolean;
  }
  if (returnUser) {
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select(
        `
    id,
    username,
    displayname,
    description,
    avatar_url
    `
      )
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError || !userProfile) {
      return null as T extends true ? ProfileType : boolean;
    }

    return userProfile as T extends true ? ProfileType : boolean;
  }
  return true as T extends true ? ProfileType : boolean;
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

type postReplyId<T extends boolean> = T extends true ? string : undefined;

export async function newPost<T extends boolean>(
  formData: FormData,
  isReply: T,
  postReplyId: postReplyId<T>
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const parseResult = postSchema.safeParse(formData);

  if (!parseResult.success)
    return { success: false, message: "Error creating post." };

  const embeddingFunction = await initializeEmbeddingPipeline();
  const embeddingResult = await embeddingFunction(parseResult.data.text);

  let postImageData: { has_images?: boolean; images?: string[] } = {};

  if (parseResult.data.images && parseResult.data.images.length > 0) {
    postImageData = {
      ...postImageData,
      has_images: true,
      images: parseResult.data.images,
    };
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      text: parseResult.data.text,
      embedding: embeddingResult,
      ...postImageData,
    })
    .select("id")
    .maybeSingle();

  if (error || !data)
    return { success: false, message: "Error creating post." };

  if (isReply) {
    const { error: err } = await supabase
      .from("postreplies")
      .insert({ post_id: postReplyId!, reply_post_id: data.id });
  }

  return { success: true, message: "Post created." };
}
