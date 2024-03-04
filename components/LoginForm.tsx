"use client";

import { Button } from "@/components/ui/button";
import githubIcon from "@/public/github-mark.svg";
import discordIcon from "@/public/discord-mark-white.svg";
import { useFormState, useFormStatus } from "react-dom";

import { Input } from "@/components/ui/input";
import {
  discordSignIn,
  githubSignIn,
  login,
  signup,
} from "@/app/login/actions";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { toast as sonner } from "sonner";
import { useEffect } from "react";

type FormValues = {
  email: string;
  password: string;
};

function displayError(errors: { message: string }[]) {
  errors.map((err) => {
    sonner("Something went wrong.", {
      description: err.message,
      closeButton: true,
    });
  });
  return null;
}

export function FormStatus() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending && (
        <div className="flex flex-row gap-4">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading...</span>
        </div>
      )}
    </>
  );
}

export default function LoginForm() {
  const { register, formState } = useForm<FormValues>({ mode: "onBlur" });
  const { errors } = formState;

  const [error, loginAction] = useFormState(login, null);
  const [signupError, signupAction] = useFormState(signup, null);

  useEffect(() => {
    if (error) {
      displayError(error.errors);
    }
    if (signupError) {
      displayError(signupError.errors);
    }
  }, [error, signupError]);

  return (
    <Card className="dark w-5/6 md:w-3/5 justify-self-center">
      <form>
        <CardHeader>
          <CardTitle>Log in or Sign up</CardTitle>
          <CardDescription>
            Use your email, github, or discordto sign in or create an account.
          </CardDescription>
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
              formAction={discordSignIn}
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
          <Input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid email format.",
              },
            })}
          />
          <p className="text-red-600 text-xs">{errors.email?.message}</p>
          <Label htmlFor="password" className="mt-1">
            Password:
          </Label>
          <Input
            id="password"
            type="password"
            {...register("password", {
              required: "Password is required.",
              minLength: { value: 8, message: "Password too short." },
            })}
          />
          <p className="text-red-600 text-xs">{errors.password?.message}</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Separator />
          <FormStatus />
          <div className="flex flex-row gap-4 pt-2">
            <Button formAction={signupAction} variant={"outline"}>
              Sign up
            </Button>
            <Button formAction={loginAction}>Log in</Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
