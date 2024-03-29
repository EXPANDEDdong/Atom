"use server";

import { createClient } from "@/utils/supabase/actions";
import { cookies } from "next/headers";

export async function blockUser(userId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("user_blocks")
    .insert({ blocked_user_id: userId });

  if (error) return null;
}

export async function unblockUser(userId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  await supabase.from("user_blocks").delete().eq("blocked_user_id", userId);
}

export type Notification = {
  id: string;
  recipient_id: string;
  created_at: string;
  data: {
    post: {
      post_id: string;
      post_date: string;
      post_text: string;
      user_data: {
        avatar_url: string;
        displayname: string;
        username: string;
      };
    };
  };
  read: boolean;
};

export async function fetchNotifications() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { unreadCount: 0, notifications: [] };
  const { data } = await supabase
    .from("notifications")
    .select(`id, recipient_id, created_at, data, read`)
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Notification[]>();

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("read", false);

  return { unreadCount: count ?? 0, notifications: data ?? [] };
}

export async function followUser(userId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  await supabase
    .from("followers")
    .insert({ followed_id: userId, follower_id: user!.id });
}
