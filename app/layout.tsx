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
import { Suspense } from "react";
import PostFeedSkeleton from "@/components/PostFeedSkeleton";
import FixIOSInputZoom from "@/components/FixIOSInputZoom";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Atom",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const originalWarn = console.warn.bind(console.warn);
  console.warn = (msg, ...params) => {
    if (
      msg.includes("Using supabase.auth.getSession() is potentially insecure")
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
              <Suspense fallback={<PostFeedSkeleton />}>
                {children}
                <FixIOSInputZoom />
              </Suspense>
              <PageSwitchButton />
              <SpeedInsights />
            </SonnerWrapper>
          </Providers>
        </UserContext>
      </body>
    </html>
  );
}
