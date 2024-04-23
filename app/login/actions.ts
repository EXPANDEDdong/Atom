"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/actions";
import { zfd } from "zod-form-data";

const accountSchema = zfd.formData(
  z.object({
    email: z.string().email("Must be valid email format."),
    password: z
      .string()
      .min(8, { message: "Password must be 8 characters or longer." })
      .regex(/^(?=.*[a-z])(?=.*[A-Z]).+$/, {
        message:
          "Password must contain at least one uppercase and one lowercase letter.",
      })
      .regex(/^(?=.*\d)(?=.*[!@#$%^&*()_+{}|:"<>?~`\-\[\]\\';,.\/]).+$/, {
        message:
          "Password must contain at least one number and one special character.",
      }),
  })
);
export async function login(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const validateResult = accountSchema.safeParse(formData);

  if (!validateResult.success) {
    return { success: false, message: "Invalid form data." };
  }

  const { error } = await supabase.auth.signInWithPassword(validateResult.data);

  if (error) {
    return { success: false, message: "Error while signing into account." };
  }

  revalidatePath("/", "layout");
  return { success: true, message: "" };
}

export async function signup(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const validateResult = accountSchema.safeParse(formData);

  if (!validateResult.success) {
    return { success: false, message: "Invalid form data." };
  }

  const {
    error,
    data: { user },
  } = await supabase.auth.signUp(validateResult.data);

  if (error) {
    return { success: false, message: "Error while signing up." };
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    message: "Please check your email and verify your account.",
  };
}

export async function githubSignIn(): Promise<{
  success: false;
  message: string;
}> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: "https://atom-one-sable.vercel.app/auth/callback/oauth",
    },
  });

  if (error) {
    return { success: false, message: "Error logging into github account." };
  }
  revalidatePath("/", "layout");
  redirect(data.url);
}

export async function discordSignIn(): Promise<{
  success: false;
  message: string;
}> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: "https://atom-one-sable.vercel.app/auth/callback/oauth",
    },
  });

  if (error) {
    return { success: false, message: "Error logging into discord account." };
  }
  revalidatePath("/", "layout");
  redirect(data.url);
}

export async function logOut() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  await supabase.auth.signOut({ scope: "global" });
}
