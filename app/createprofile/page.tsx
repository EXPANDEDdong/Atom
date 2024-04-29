"use client";

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
import { toast as sonner } from "sonner";
import { z } from "zod";
import { redirect } from "next/navigation";

export default function CreateProfile() {
  return (
    <main className={cn("w-full h-screen grid")}>
      <Card className="justify-self-center self-center w-4/5">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const loading = sonner.loading("Creating profile...");
            const formData = new FormData(e.target as HTMLFormElement);

            const result = await createProfile(formData);

            if (!result.success) {
              sonner.error("Error creating profile.", {
                duration: 4000,
                description: result.message,
                id: loading,
              });
              return;
            }

            sonner.success(result.message, {
              duration: 3000,
              id: loading,
            });

            return redirect("/");
          }}
        >
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
    </main>
  );
}
