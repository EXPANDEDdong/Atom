"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

function signOut() {
  const supabase = createClient();
  supabase.auth.signOut();
}

export default function SignOutButton() {
  return (
    <Button
      onClick={signOut}
      className="w-full flex flex-col gap-1 p-2 text-start"
    >
      <p className="font-semibold text-lg">Sign out from account</p>
      <Separator />
      <p className="text-muted-foreground font-normal">
        You can log in again later.
      </p>
    </Button>
  );
}
