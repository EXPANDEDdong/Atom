"use client";

import { useContext, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { SessionContext } from "@/app/UserContext";
import Image from "next/image";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";
import { updateProfile } from "@/app/settings/actions";

export default function UpdateProfile() {
  const user = useContext(SessionContext);
  const [avatar, setAvatar] = useState<File | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  if (!user) return null;
  return (
    <div>
      <form action={updateProfile}>
        <div className="flex flex-col gap-4">
          <div className="w-full flex justify-between space-x-4 pt-8">
            <Button
              variant={"ghost"}
              className="w-fit h-fit relative group flex justify-center items-center"
              onClick={() => ref.current?.click()}
              type="button"
            >
              <Pencil className="group-hover:opacity-90 opacity-0 absolute z-40 transition-opacity" />
              <div className="relative h-32 w-32 overflow-hidden rounded-full z-20 group-hover:brightness-75 transition-all">
                <Image
                  src={
                    avatar
                      ? URL.createObjectURL(avatar)
                      : user.user_metadata.profile_avatar_url
                  }
                  alt={`User avatar`}
                  fill
                  className="object-cover h-full absolute z-30"
                />
              </div>
            </Button>
            <div className="space-y-1 grow">
              <div className="flex  flex-col gap-1">
                <Label>Display name</Label>
                <Input
                  type="text"
                  name="displayname"
                  placeholder={user.user_metadata.displayname}
                />
              </div>
              <div className="flex  flex-col gap-1">
                <Label>Username</Label>
                <Input
                  type="text"
                  name="username"
                  placeholder={user.user_metadata.username}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="bio">Description</Label>
            <Textarea
              id="bio"
              name="description"
              placeholder={user.user_metadata.description}
              className="resize-none"
            />
          </div>
        </div>
        <input
          type="file"
          ref={ref}
          className="hidden"
          name="avatar"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files) return;
            const file = files[0];
            setAvatar(file);
          }}
        />
        <div className="h-fit w-full flex flex-row justify-end">
          <Button type="submit" variant={"outline"} className="mt-1">
            Apply changes
          </Button>
        </div>
      </form>
    </div>
  );
}
