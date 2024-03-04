"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { zfd } from "zod-form-data";
import { createClient } from "@/utils/supabase/actions";

const profileSchema = zfd.formData({
  username: zfd.text(),
  displayName: zfd.text(),
  description: zfd.text(),
});

export async function createProfile(formData: FormData) {
  const parsedData = profileSchema.safeParse(formData);

  if (!parsedData.success) {
    return null;
  }

  const { username, displayName, description } = parsedData.data;
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) return null;

  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    username: username,
    displayname: displayName,
    description: description,
  });
  if (profileError) return null;

  const { error: userError } = await supabase.auth.updateUser({
    data: { hasProfile: true },
  });

  if (userError) return null;

  return redirect("/");
}
