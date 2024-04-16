"use server";

import { createClient } from "@/utils/supabase/actions";
import { cookies } from "next/headers";

export async function readAllNotifications() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  await supabase.from("notifications").update({ read: true }).eq("read", false);
}
