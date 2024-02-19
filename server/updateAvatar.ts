"use server";

import { createClient } from "@/utils/supabase/actions";
import { cookies } from "next/headers";

export async function updateAvatar(path: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const avatarUrl = `${process.env
    .NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/object/public/images/${path}`;
  const { data } = await supabase.auth.updateUser({
    data: { avatar: avatarUrl },
  });
  return data.user?.user_metadata.avatar as string;
}
