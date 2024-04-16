"use server";

import sharp from "sharp";
import { zfd } from "zod-form-data";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/actions";
import { z } from "zod";

const avatarSchema = zfd.formData({
  avatar: zfd.file(),
});

const profileSchema = zfd.formData({
  username: zfd.text(),
  displayname: zfd.text(),
  description: zfd.text(),
  avatar: zfd.file(z.instanceof(File).optional()),
});

export async function updateProfile(formData: FormData) {
  const parsedData = profileSchema.safeParse(formData);

  if (!parsedData.success) {
    return null;
  }

  const { username, displayname, description, avatar } = parsedData.data;
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) return null;

  let userUpdateData: {
    username: string;
    displayname: string;
    description: string;
    avatar_url?: string;
  } = {
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
    .update(userUpdateData)
    .eq("id", user.id);
  if (profileError) return null;

  const { error: userError } = await supabase.auth.updateUser({
    data: {
      hasProfile: true,
      username: userUpdateData.username,
      displayname: userUpdateData.displayname,
      description: userUpdateData.description,
      profile_avatar_url: userUpdateData.avatar_url,
    },
  });
  if (userError) return null;

  return "Success";
}

export async function cropAndUploadAvatar(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const parsed = avatarSchema.safeParse(formData);

  if (!parsed.success) return null;

  const imageBuffer = Buffer.from(await parsed.data.avatar.arrayBuffer());

  const image = sharp(imageBuffer);

  const { width, height } = await image.metadata();

  if (!width || !height) return null;

  const uniqueName = crypto.randomUUID();

  const finalImage = await image
    .extract({
      height: height,
      top: 0,
      left: Math.round((width - height) / 2),
      width: height,
    })
    .webp({ quality: 40 })
    .toBuffer({ resolveWithObject: false });

  const { data, error } = await supabase.storage
    .from("images")
    .upload(`avatars/${uniqueName}.webp`, finalImage, {
      contentType: "image/webp",
    });

  if (error) return null;

  return `${process.env
    .NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/object/public/images/${data.path}`;
}
