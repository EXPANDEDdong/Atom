"use client";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { createContext, useEffect, useMemo, useState } from "react";

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
      console.log(event);
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

  const memoizedSession = useMemo(() => session, [session]);

  return (
    <SessionContext.Provider value={memoizedSession}>
      {children}
    </SessionContext.Provider>
  );
}
