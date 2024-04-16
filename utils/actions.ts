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

export async function getCurrentUser() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id || null;
}

type ProfileInfo = {
  id: string;
  displayname: string;
  description: string;
  avatar_url: string;
  has_followed: boolean;
  has_blocked: boolean;
  is_blocked: boolean;
  followers: number;
  following: number;
};

export async function getUserPageProfile(username: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase.rpc("get_profile_info", {
    username_param: username,
  });

  if (!data) return null;

  const userData = data[0];

  if (userData.is_blocked) return "blocked";

  const { is_blocked, ...userDataWithoutBlocked } = userData;

  return userDataWithoutBlocked;
}
export type FetchParameters = {
  type: "all" | "personal" | "user" | "replies" | "search";
  searchQuery: string | null;
  userId: string | null;
  postId: string | null;
};

export type Post = {
  id: string;
  text: string;
  created_at: string;
  has_images: boolean;
  images: string[] | null;
  profiles: {
    author_id: string;
    username: string;
    avatar_url: string;
    displayname: string;
    description: string;
  };
  reply_to: string | null;
  reply_count: number;
  has_liked: boolean;
  has_viewed: boolean;
  has_saved: boolean;
  likecount: number;
  viewcount: number;
  savecount: number;
};

export async function getRecommendedPosts({
  pageParameters,
}: {
  pageParameters: {
    totalPage: number;
    recommendationIndex: number;
    pageOnIndex: number;
  };
}): Promise<
  | string
  | {
      data: Post[];
      newParameters: {
        newTotalPage: number;
        newRecommendationIndex: number;
        newPageOnIndex: number;
      };
    }
> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .rpc("match_posts_with_recommendations", {
      recommendation_index: pageParameters.recommendationIndex,
      page: pageParameters.pageOnIndex,
      match_threshold: 0.72,
    })
    .returns<Post[]>();

  if (!data || error) {
    if (error) {
      return error.message;
    }
    return "Error: No data returned.";
  }

  const newParameters = {
    newTotalPage: pageParameters.totalPage + 1,
    newRecommendationIndex:
      data.length < 10
        ? pageParameters.recommendationIndex + 1
        : pageParameters.recommendationIndex,
    newPageOnIndex: data.length < 10 ? 0 : pageParameters.pageOnIndex + 1,
  };

  return { data, newParameters };
}

async function getAllPosts({
  pageParameters,
}: {
  pageParameters: {
    totalPage: number;
    recommendationIndex: number;
    pageOnIndex: number;
  };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .rpc("get_all_posts", {
      page: pageParameters.totalPage,
    })
    .returns<Post[]>();

  if (!data || error) {
    if (error) {
      return error.message;
    }
    return "Error: No data returned.";
  }

  const newParameters = {
    newTotalPage: pageParameters.totalPage + 1,
    newRecommendationIndex: pageParameters.recommendationIndex,
    newPageOnIndex: pageParameters.pageOnIndex,
  };

  return { data, newParameters };
}

async function getUserPosts({
  userId,
  pageParameters,
}: {
  userId: string;
  pageParameters: {
    totalPage: number;
    recommendationIndex: number;
    pageOnIndex: number;
  };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .rpc("get_posts_from_user", {
      id_of_user: userId,
      page: pageParameters.totalPage,
    })
    .returns<Post[]>();

  if (!data || error) {
    if (error) {
      return error.message;
    }
    return "Error: No data returned.";
  }

  const newParameters = {
    newTotalPage: pageParameters.totalPage + 1,
    newRecommendationIndex: pageParameters.recommendationIndex,
    newPageOnIndex: pageParameters.pageOnIndex,
  };

  return { data, newParameters };
}

async function getPostReplies({
  postId,
  pageParameters,
}: {
  postId: string;
  pageParameters: {
    totalPage: number;
    recommendationIndex: number;
    pageOnIndex: number;
  };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .rpc("get_replies_to_post", {
      id_of_post: postId,
      page: pageParameters.totalPage,
    })
    .returns<Post[]>();

  if (!data || error) {
    if (error) {
      return error.message;
    }
    return "Error: No data returned.";
  }

  const newParameters = {
    newTotalPage: pageParameters.totalPage + 1,
    newRecommendationIndex: pageParameters.recommendationIndex,
    newPageOnIndex: pageParameters.pageOnIndex,
  };

  return { data, newParameters };
}

async function searchPosts({
  query,
  pageParameters,
}: {
  query: string;
  pageParameters: {
    totalPage: number;
    recommendationIndex: number;
    pageOnIndex: number;
  };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .rpc("search_posts_by_text", {
      query: query,
      page: pageParameters.totalPage,
    })
    .returns<Post[]>();

  if (!data || error) {
    if (error) {
      return error.message;
    }
    return "Error: No data returned.";
  }

  const newParameters = {
    newTotalPage: pageParameters.totalPage + 1,
    newRecommendationIndex: pageParameters.recommendationIndex,
    newPageOnIndex: pageParameters.pageOnIndex,
  };

  return { data, newParameters };
}

export async function searchUsers({
  page,
  query,
}: {
  query: string;
  page: number;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.rpc("search_users", {
    query,
    page,
  });

  if (!data || error) {
    if (error) {
      return error.message;
    }
    return "Error: No data returned.";
  }

  const nextPage = data.length < 10 ? page : page + 1;

  return { data, nextPage };
}

export async function getPosts({
  fetchParameters,
  pageParameters,
}: {
  fetchParameters: FetchParameters;
  pageParameters: {
    totalPage: number;
    recommendationIndex: number;
    pageOnIndex: number;
  };
}) {
  if (fetchParameters.type === "personal") {
    return await getRecommendedPosts({ pageParameters });
  } else if (fetchParameters.type === "all") {
    return await getAllPosts({ pageParameters });
  } else if (fetchParameters.type === "user") {
    if (!fetchParameters.userId) return "Error: No user id provided.";

    return await getUserPosts({
      userId: fetchParameters.userId,
      pageParameters,
    });
  } else if (fetchParameters.type === "replies") {
    if (!fetchParameters.postId) return "Error: No post id provided.";

    return await getPostReplies({
      postId: fetchParameters.postId,
      pageParameters,
    });
  } else if (fetchParameters.type === "search") {
    if (!fetchParameters.searchQuery) return "Error: No search query provided.";

    return await searchPosts({
      query: fetchParameters.searchQuery,
      pageParameters,
    });
  }
  return "Error: no type provided for fetch function.";
}

export async function likePost(hasLiked: boolean, postId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  if (!hasLiked) {
    await supabase.from("likes").insert({ post_id: postId });
    return;
  }
  await supabase.from("likes").delete().eq("post_id", postId);
  return;
}

export async function savePost(hasSaved: boolean, postId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  if (!hasSaved) {
    await supabase.from("saves").insert({ post_id: postId });
    return;
  }
  await supabase.from("saves").delete().eq("post_id", postId);
  return;
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

export async function deletePost(postId: string, authorId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== authorId) {
    return 401;
  }

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    return 400;
  }

  return 200;
}
