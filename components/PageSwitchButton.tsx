"use client";

import { SessionContext } from "@/app/UserContext";
import { useContext, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  BookOpen,
  Newspaper,
  MessageSquarePlus,
  Mailbox,
  MessagesSquare,
} from "lucide-react";
import Link from "next/link";
import PostForm from "./PostForm";
import { usePathname } from "next/navigation";
export default function PageSwitchButton() {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const path = usePathname();
  const user = useContext(SessionContext);

  if (!user || path.split("/").includes("chats")) return null;

  return (
    <aside className="fixed z-50 bottom-4 left-4">
      <Dialog>
        <DropdownMenu open={dropDownOpen} onOpenChange={setDropDownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"secondary"}
              size={"default"}
              className="flex flex-row gap-2 px-6 py-4 text-xl w-fit h-fit"
            >
              <BookOpen />
              <span className="hidden md:inline-block">Pages</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <DialogTrigger asChild>
                <Button
                  variant={"default"}
                  className="flex flex-row w-full h-full gap-2 font-normal"
                >
                  <MessageSquarePlus strokeWidth={2} width={16} height={16} />{" "}
                  New post
                </Button>
              </DialogTrigger>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex flex-row w-full gap-4 px-4"
              asChild
            >
              <Link href={"/myfeed"}>
                <Mailbox strokeWidth={2} width={16} height={16} />
                My feed
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex flex-row w-full gap-4 px-4"
              asChild
            >
              <Link href={"/"}>
                <Newspaper strokeWidth={2} width={16} height={16} /> Global feed
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex flex-row w-full gap-4 px-4"
              asChild
            >
              <Link href={"/chats"}>
                <MessagesSquare strokeWidth={2} width={16} height={16} />
                Messages
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent className="top-[30%] sm:top-[40%] md:top-[50%]">
          <div className="h-fit">
            <PostForm queryKey={["posts", "all"]} replyToId={null} />
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
