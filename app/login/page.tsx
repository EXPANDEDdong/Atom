"use server";

import { Button } from "@/components/ui/button";
import githubIcon from "@/public/github-mark.svg";
import discordIcon from "@/public/discord-mark-white.svg";

import { Input } from "@/components/ui/input";
import { githubSignIn, login, signup } from "./actions";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export default async function Home() {
  return (
    <main className="min-h-screen grid items-center">
      <Card className="dark w-3/5 justify-self-center">
        <form>
          <CardHeader>
            <CardTitle>Log in or Sign up</CardTitle>
            <div className="flex flex-row w-full gap-2 py-2">
              <Button
                formAction={githubSignIn}
                size={"default"}
                variant={"outline"}
                className="p-1 w-full flex flex-row gap-1"
              >
                <Image
                  priority
                  src={githubIcon}
                  width={18}
                  height={18}
                  alt="Github"
                />{" "}
                <span>Github</span>
              </Button>
              <Separator orientation="vertical" decorative={true} />
              <Button
                formAction={githubSignIn}
                size={"default"}
                variant={"outline"}
                className="p-1 w-full flex flex-row gap-1"
              >
                <Image
                  priority
                  src={discordIcon}
                  width={18}
                  height={18}
                  alt="Discord"
                />{" "}
                <span>Discord</span>
              </Button>
            </div>
            <Separator />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Label htmlFor="email">Email:</Label>
            <Input id="email" name="email" type="email" required />
            <Label htmlFor="password">Password:</Label>
            <Input id="password" name="password" type="password" required />
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Separator />
            <div className="flex flex-row gap-4">
              <Button formAction={signup} variant={"outline"}>
                Sign up
              </Button>
              <Button formAction={login}>Log in</Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
