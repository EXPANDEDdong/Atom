"use client";

import { Atom } from "lucide-react";
import CurrentRouteBreadcrumbs from "./CurrentRouteBreadcrumbs";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { cn } from "@/lib/utils";
import React, { useContext, useState } from "react";
import Link from "next/link";
import { UrlObject } from "url";
import Image from "next/image";
import { SessionContext } from "@/app/UserContext";
import { createClient } from "@/utils/supabase/client";
import NotificationButton from "./NotificationButton";

function signOut() {
  const supabase = createClient();
  supabase.auth.signOut();
}

export default function Navbar() {
  const user = useContext(SessionContext);

  return (
    <>
      <div className="w-full flex flex-row px-6 py-2 bg-black/10 backdrop-blur fixed z-[100] border-b border-border">
        <div className="w-full hidden min-[1590px]:flex min-[1590px]:flex-col items-start justify-center">
          <div className="px-2">
            <CurrentRouteBreadcrumbs />
          </div>
        </div>
        <div className="w-full flex flex-col items-start min-[1590px]:items-center justify-center">
          <Button
            variant={"ghost"}
            className="flex flex-row gap-4 text-xl font-semibold justify-self-center h-full"
            asChild
          >
            <Link href={"/"}>
              <Atom />
              <span>Atom</span>
            </Link>
          </Button>
        </div>

        <div className="w-full flex flex-col items-end justify-center">
          {user ? (
            <NavigationMenu orientation="vertical">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    asChild
                  >
                    <Link href={"/chats"}>My Chats</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NotificationButton userId={user.id} />
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <div className="flex flex-row gap-2 items-center">
                      {user.user_metadata.displayname}
                      <div className="h-8 w-8 relative overflow-hidden rounded-full">
                        <Image
                          src={
                            user.user_metadata.profile_avatar_url ??
                            "https://wjucegfkshgallheqlzz.supabase.co/storage/v1/object/public/images/avatars/no-profile-picture-icon.webp"
                          }
                          alt="profile picture"
                          fill
                          className="h-full object-cover absolute z-10"
                        />
                      </div>
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] z-110">
                      <li className="row-span-2">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full relative overflow-hidden select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href={`/user/${user.user_metadata.username}`}
                          >
                            <Image
                              src={
                                user.user_metadata.profile_avatar_url ??
                                "https://wjucegfkshgallheqlzz.supabase.co/storage/v1/object/public/images/avatars/no-profile-picture-icon.webp"
                              }
                              alt="profile picture"
                              fill
                              className="h-full object-cover absolute brightness-50 z-10"
                            />
                            <div className="mb-2 mt-4 text-lg font-medium z-20">
                              {user.user_metadata.displayname}
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground z-20">
                              {user.user_metadata.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href={"/settings"} title="Settings">
                        Change your settings for Atom and your account
                      </ListItem>
                      <li>
                        <NavigationMenuLink asChild>
                          <button
                            onClick={signOut}
                            className={
                              "block w-full select-none text-start space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            }
                          >
                            <div className="text-sm font-medium leading-none">
                              Log Out
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Log out from your Atom account
                            </p>
                          </button>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          ) : (
            <Button asChild>
              <Link href={"/login"}>Log In</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="h-16"></div>
    </>
  );
}

function ListItem({
  className,
  title,
  children,
  href,
}: {
  className?: string;
  title?: string;
  children: React.ReactNode;
  href: string | UrlObject;
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
