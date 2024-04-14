"use client";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { createContext, useEffect, useState } from "react";

export const SessionContext = createContext<User | null>(null);

export default function UserContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(createClient());
  const [session, setSession] = useState<User | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
      } else if (session) {
        setSession(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}
