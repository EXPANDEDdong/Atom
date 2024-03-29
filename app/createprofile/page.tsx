"use server";

import { Input } from "@/components/ui/input";
import { createProfile, tempFunction } from "./actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FormStatus } from "@/components/LoginForm";

export default async function CreateProfile() {
  return (
    <main className={cn("w-full h-screen grid")}>
      <Card className="justify-self-center self-center w-4/5">
        <form action={createProfile}>
          <CardHeader>
            <CardTitle>Create profile data</CardTitle>
            <CardDescription>
              Create a profile for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="username">Username:</Label>
              <Input
                name="username"
                id="username"
                type="text"
                placeholder="Username..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="displayname">Display name:</Label>
              <Input
                name="displayname"
                id="displayname"
                type="text"
                placeholder="User display name..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="avatar">Avatar:</Label>
              <Input
                name="avatar"
                id="avatar"
                type="file"
                placeholder="User Avatar..."
              />
            </div>
            <div>
              <Label htmlFor="description">Description:</Label>
              <Textarea
                name="description"
                id="description"
                className="resize-none"
                placeholder="User description..."
              />
            </div>
            <div className="w-full flex flex-row justify-center">
              <FormStatus />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Create
            </Button>
          </CardFooter>
        </form>
      </Card>
      <form action={tempFunction}>
        <button type="submit">yes</button>
      </form>
    </main>
  );
}
