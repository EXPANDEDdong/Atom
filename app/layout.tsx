import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "./Providers";
import Navbar from "@/components/Navbar";
import UserContext from "./UserContext";
import PageSwitchButton from "@/components/PageSwitchButton";
import SonnerWrapper from "@/components/SonnerWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import PostFeedSkeleton from "@/components/PostFeedSkeleton";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Atom",
  description: "Social media hobby project made for graduation 2024.",
  metadataBase: new URL("https://atom-one-sable.vercel.app"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const originalWarn = console.warn.bind(console.warn);
  console.warn = (msg, ...params) => {
    if (
      msg.includes(
        "Using supabase.auth.getSession() is potentially insecure"
      ) ||
      msg.includes(
        "Using the user object as returned from supabase.auth.getSession()"
      )
    ) {
      return;
    }
    originalWarn(msg, ...params);
  };
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased dark relative",
          fontSans.variable
        )}
      >
        <UserContext>
          <Providers>
            <SonnerWrapper>
              <Navbar />
              <Suspense fallback={<PostFeedSkeleton />}>{children}</Suspense>
              <PageSwitchButton />
              <SpeedInsights />
              <Analytics />
            </SonnerWrapper>
          </Providers>
        </UserContext>
      </body>
    </html>
  );
}
