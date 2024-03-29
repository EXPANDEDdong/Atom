"use client";
import { useContext } from "react";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { blockUser } from "@/app/user/[username]/actions";
import { SessionContext } from "@/app/UserContext";
import { ShieldX } from "lucide-react";

export default function BlockButton({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  const user = useContext(SessionContext);

  if (!user || user.id === userId) return null;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant={"outline"} className="w-full flex flex-row gap-2">
          <ShieldX />
          Block user
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <form action={blockUser.bind(null, userId)}>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle>Block {username}?</DrawerTitle>
              <DrawerDescription>
                This can be undone later in settings.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button type="submit" variant={"destructive"}>
                Block
              </Button>
              <DrawerClose asChild>
                <Button type="button" variant={"outline"}>
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
