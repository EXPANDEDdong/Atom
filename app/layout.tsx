import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "./Providers";
import Navbar from "@/components/Navbar";
import UserContext from "./UserContext";
import PageSwitchButton from "@/components/PageSwitchButton";

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
            <Navbar />
            {children}
            <PageSwitchButton />
          </Providers>
        </UserContext>
      </body>
    </html>
  );
}
