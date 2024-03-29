"use server";

import sharp from "sharp";
import { zfd } from "zod-form-data";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/actions";

const avatarSchema = zfd.formData({
  avatar: zfd.file(),
});

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

  console.log(data);

  if (error) return null;

  console.log(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/object/public/images/${
      data.path
    }`
  );

  return `${process.env
    .NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/object/public/images/${data.path}`;
}
