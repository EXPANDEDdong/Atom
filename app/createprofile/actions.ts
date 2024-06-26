"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { zfd } from "zod-form-data";
import { createClient } from "@/utils/supabase/actions";
import { z } from "zod";
import { cropAndUploadAvatar } from "../settings/actions";

const profileSchema = zfd.formData({
  username: zfd.text(),
  displayname: zfd.text(),
  description: zfd.text(),
  avatar: zfd.file(z.instanceof(File).optional()),
});

export async function createProfile(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const parsedData = profileSchema.safeParse(formData);

  if (!parsedData.success) {
    return { success: false, message: "Invalid profile data." };
  }

  const { username, displayname, description, avatar } = parsedData.data;
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error)
    return { success: false, message: "Failed to retrieve current user." };

  let userUpdateData: {
    id: string;
    username: string;
    displayname: string;
    description: string;
    avatar_url?: string;
  } = {
    id: user.id,
    username: username,
    displayname: displayname,
    description: description,
  };

  if (avatar) {
    const imageForm = new FormData();
    imageForm.set("avatar", avatar);
    const avatarUrl = await cropAndUploadAvatar(imageForm);
    userUpdateData.avatar_url = avatarUrl ?? undefined;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .insert(userUpdateData);
  if (profileError)
    return { success: false, message: "Failed to create profile." };

  const { error: userError } = await supabase.auth.updateUser({
    data: {
      hasProfile: true,
      username: userUpdateData.username,
      displayname: userUpdateData.displayname,
      description: userUpdateData.description,
      profile_avatar_url: userUpdateData.avatar_url,
    },
  });
  if (userError)
    return { success: false, message: "Failed to update user object." };

  return { success: true, message: "Successfully created profile." };
}

export async function tempFunction() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  await supabase.auth.updateUser({
    data: {
      profile_avatar_url:
        "https://wjucegfkshgallheqlzz.supabase.co/storage/v1/object/public/images/avatars/1785d5ff-b255-43f8-a687-2a4385b47830.webp",
    },
  });
}
