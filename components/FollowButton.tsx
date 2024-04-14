"use client";
import { UserRoundMinus, UserRoundPlus } from "lucide-react";
import { Button } from "./ui/button";
import { useContext, useState } from "react";
import { SessionContext } from "@/app/UserContext";
import { followUser, unFollowUser } from "@/app/user/[username]/actions";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";

export default function FollowButton({
  userId,
  username,
  hasFollowed,
}: {
  userId: string;
  username: string;
  hasFollowed: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(hasFollowed);
  const [isOpen, setIsOpen] = useState(false);
  const user = useContext(SessionContext);

  if (!user || user.id === userId) return null;

  return (
    <>
      <Button
        className="w-full"
        variant={isFollowing ? "outline" : "default"}
        onClick={async () => {
          if (!isFollowing) {
            await followUser(userId);
            setIsFollowing(true);
          } else {
            setIsOpen(true);
          }
        }}
      >
        {!isFollowing ? (
          <>
            <UserRoundPlus /> Follow
          </>
        ) : (
          <>
            <UserRoundMinus /> Unfollow
          </>
        )}
      </Button>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              if (isFollowing) {
                await unFollowUser(userId);
                setIsFollowing(false);
              }

              setIsOpen(false);
            }}
          >
            <div className="mx-auto w-full max-w-lg">
              <DrawerHeader>
                <DrawerTitle>Unfollow {username}?</DrawerTitle>
              </DrawerHeader>
              <DrawerFooter>
                <Button type="submit" variant={"secondary"}>
                  Unfollow
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
    </>
  );
}
