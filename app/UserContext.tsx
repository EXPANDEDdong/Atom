"use client";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { createContext, useEffect, useState } from "react";

export const SessionContext = createContext<User | null>(null);

export default function UserContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(createClient());
  const [session, setSession] = useState<User | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const verifySession = async (user: User) => {
      const {
        data: { user: currentUser },
      } = await client.auth.getUser();
      if (!currentUser || user.id !== currentUser.id) {
        console.log("Session invalid.");
        setSession(null);
        setIsSignedIn(false);
        client.auth.signOut();
        return;
      }
      setSession(user);
      console.log("Session verified.");
    };

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      console.log(event);
      if (event === "SIGNED_OUT") {
        setSession(null);
      } else if (session) {
        if (event === "SIGNED_IN" && !isSignedIn) {
          setSession(session.user);
        } else {
          verifySession(session.user);
          if (!isSignedIn) {
            setIsSignedIn(true);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, isSignedIn]);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}
