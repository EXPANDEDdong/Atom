"use server";

import { PostSelectReturn } from "@/utils/actions";
import { createClient } from "@/utils/supabase/actions";
import { cookies } from "next/headers";

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

export async function getPostPage(currentId: string | null, postId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let queryWithId = queryNoId;

  if (currentId) queryWithId = queryHasId;

  let query = supabase.from("posts").select(queryWithId).eq("id", postId);

  if (currentId) {
    query = query
      .eq("likes.user_id", currentId)
      .eq("views.user_id", currentId)
      .eq("saves.user_id", currentId);
  }
  const { data, error } = await query.returns<PostSelectReturn>().maybeSingle();

  if (error || !data) {
    return null;
  }

  if (currentId) {
    const { data: dat } = await supabase
      .from("views")
      .select("*", { count: "planned", head: true })
      .eq("post_id", postId)
      .eq("user_id", currentId);
    console.log(dat);
    if (!dat) {
      const { error: err } = await supabase
        .from("views")
        .insert({ post_id: postId });

      console.log(err);
    }
  }

  return data;
}

const queryRepliesHasId: string = `
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
profiles (
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

export async function getPostReplies(
  currentId: string | null,
  replyPostId: string,
  page: number
) {
  const rangeStart = page * 10;
  const rangeEnd = rangeStart + 10;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let queryWithId = queryRepliesNoId;

  if (currentId) queryWithId = queryRepliesHasId;

  let query = supabase
    .from("posts")
    .select(queryWithId)
    .order("created_at", { ascending: false })
    .eq("postreplies.post_id", replyPostId)
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
