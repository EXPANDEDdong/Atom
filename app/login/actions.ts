"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/actions";

const accountSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email({ message: "Invalid email adress" }),
  password: z
    .string({ required_error: "Password is required." })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:"<>?~`\-\[\]\\';,.\/]).{8,}$/,
      "Password must be at least 8 characters long, and contain at least: 1 uppercase letter, 1 lowercase letter, 1 digit, and one special character."
    ),
});
export async function login(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; errors: { message: string }[] }> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const inputs = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validateResult = accountSchema.safeParse(inputs);

  if (!validateResult.success) {
    return { success: false, errors: validateResult.error.issues };
  }

  const { error } = await supabase.auth.signInWithPassword(validateResult.data);

  if (error) {
    return { success: false, errors: [{ message: error.message }] };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; errors: { message: string }[] }> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const inputs = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validateResult = accountSchema.safeParse(inputs);

  if (!validateResult.success) {
    return { success: false, errors: validateResult.error.issues };
  }

  const {
    error,
    data: { user },
  } = await supabase.auth.signUp(validateResult.data);

  if (error) {
    return { success: false, errors: [{ message: error.message }] };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function githubSignIn() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: "http://localhost:3000/auth/callback/oauth",
    },
  });

  if (error) {
    redirect("/error");
  }
  revalidatePath("/", "layout");
  redirect(data.url);
}

export async function discordSignIn() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: "http://localhost:3000/auth/callback/oauth",
    },
  });

  if (error) {
    redirect("/error");
  }
  revalidatePath("/", "layout");
  redirect(data.url);
}

export async function logOut() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  await supabase.auth.signOut({ scope: "global" });
}
