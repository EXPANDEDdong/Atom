import { createClient } from "@/utils/supabase/actions";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (user?.user_metadata.hasProfile === undefined) {
        const { error: accError } = await supabase.auth.updateUser({
          data: { hasProfile: false },
        });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.log(error);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/error`);
}
