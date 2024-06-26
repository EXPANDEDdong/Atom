"use client";
import { newChat } from "@/app/chats/[chatId]/actions";
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
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { MessageCircle } from "lucide-react";
import { useContext, useState } from "react";
import { SessionContext } from "@/app/UserContext";

export default function NewDmButton({ userId }: { userId: string }) {
  const user = useContext(SessionContext);
  const [open, setOpen] = useState(false);

  if (!user || user.id === userId) return null;
  else
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button className="flex flex-row w-full gap-2" variant={"secondary"}>
            <MessageCircle />
            New Message
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              await newChat([userId], formData);
              setOpen(false);
            }}
          >
            <div className="w-full max-w-lg mx-auto">
              <DrawerHeader>
                <DrawerTitle>Say hi!</DrawerTitle>
                <DrawerDescription>Send a first message.</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 pb-0">
                <div className="w-full">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label>Message</Label>
                      <Input
                        type="text"
                        name="content"
                        placeholder="Message..."
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DrawerFooter>
                <Button type="submit" variant={"secondary"}>
                  Send
                </Button>
                <DrawerClose asChild>
                  <Button variant={"outline"}>Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    );
}
