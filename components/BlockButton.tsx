"use client";
import { useContext, useState } from "react";
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
import { blockUser, unblockUser } from "@/app/user/[username]/actions";
import { SessionContext } from "@/app/UserContext";
import { ShieldCheck, ShieldX } from "lucide-react";

export default function BlockButton({
  userId,
  username,
  hasBlocked,
}: {
  userId: string;
  username: string;
  hasBlocked: boolean;
}) {
  const [isBlocked, setIsBlocked] = useState(hasBlocked);
  const [isOpen, setIsOpen] = useState(false);
  const user = useContext(SessionContext);

  if (!user || user.id === userId) return null;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant={"outline"} className="w-full flex flex-row gap-2">
          {isBlocked ? (
            <>
              <ShieldCheck /> Unblock
            </>
          ) : (
            <>
              <ShieldX /> Block
            </>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            if (!isBlocked) {
              await blockUser(userId);
            } else {
              await unblockUser(userId);
            }
            setIsOpen(false);
          }}
        >
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle>
                {isBlocked ? "Unblock" : "Block"} {username}?
              </DrawerTitle>
              {!isBlocked && (
                <DrawerDescription>
                  This can be undone later in settings.
                </DrawerDescription>
              )}
            </DrawerHeader>
            <DrawerFooter>
              <Button
                type="submit"
                variant={!isBlocked ? "destructive" : "secondary"}
              >
                {isBlocked ? "Unblock" : "Block"}
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
