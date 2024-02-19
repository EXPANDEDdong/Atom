import { createClient } from "@/utils/supabase/actions";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zfd } from "zod-form-data";

const schema = zfd.formData({
  avatar: zfd.file(z.instanceof(File).optional()),
  username: zfd.text(z.string().optional()),
  description: zfd.text(z.string().optional()),
});

export async function POST(request: NextRequest) {
  const result = await schema.safeParseAsync(await request.formData());
  if (!result.success)
    return NextResponse.json(
      { success: false },
      { status: 404, statusText: "you suck" }
    );

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const currentUser = await supabase.auth.getUser();
  if (!currentUser.data.user || currentUser.error) {
    return NextResponse.json(
      { success: false },
      { status: 404, statusText: "you suck" }
    );
  }

  let userUpdateData: {
    username?: string;
    description?: string;
    avatar_url?: string;
  } = {};

  if (result.data.username) {
    userUpdateData = {
      ...userUpdateData,
      username: result.data.username,
    };
  }

  if (result.data.description) {
    userUpdateData = {
      ...userUpdateData,
      description: result.data.description,
    };
  }

  if (result.data.avatar) {
    const newAvatar = result.data.avatar;

    const userUid = currentUser.data.user.id;
    const uploadRes = await supabase.storage
      .from("images")
      .upload(`avatars/${userUid}/${newAvatar.name}`, newAvatar);

    if (uploadRes.error || !uploadRes.data) {
      return NextResponse.json(
        { success: false },
        { status: 404, statusText: "you suck" }
      );
    }

    const newAvatarPath = `${process.env
      .NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/object/public/images/${
      uploadRes.data.path
    }`;

    userUpdateData = {
      ...userUpdateData,
      avatar_url: newAvatarPath,
    };
  }

  if (Object.keys(userUpdateData).length > 0) {
    const userUid = currentUser.data.user.id;
    const { data, error } = await supabase
      .from("profiles")
      .update(userUpdateData)
      .eq("id", userUid)
      .select();

    if (error) {
      return NextResponse.json(
        { success: false },
        { status: 404, statusText: "you suck" }
      );
    }
    const newData = data[0];

    const authUpdate = await supabase.auth.updateUser({
      data: { display_name: newData, avatar: newData.avatar_url },
    });

    if (authUpdate.error) {
      return NextResponse.json(
        { success: false },
        { status: 405, statusText: authUpdate.error.message }
      );
    }
  }

  revalidatePath("/", "page");
  return NextResponse.json({ success: true }, { status: 200 });
}
