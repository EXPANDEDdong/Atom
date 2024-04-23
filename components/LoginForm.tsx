"use client";

import { Button } from "@/components/ui/button";
import githubIcon from "@/public/github-mark.svg";
import discordIcon from "@/public/discord-mark-white.svg";
import { useFormStatus } from "react-dom";

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
import {
  type SubmitHandler,
  useForm,
  useWatch,
  Control,
} from "react-hook-form";
import { toast as sonner } from "sonner";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { redirect } from "next/navigation";

type FormValues = {
  email: string;
  password: string;
};

export function FormStatus() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending && (
        <div className="flex flex-row gap-4">
          <svg
            className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
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

const loginSchema = z.object({
  email: z.string().email("Must be valid email format."),
  password: z
    .string()
    .min(8, { message: "Password must be 8 characters or longer." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z]).+$/, {
      message:
        "Password must contain at least one uppercase and one lowercase letter.",
    })
    .regex(/^(?=.*\d)(?=.*[!@#$%^&*()_+{}|:"<>?~`\-\[\]\\';,.\/]).+$/, {
      message:
        "Password must contain at least one number and one special character.",
    }),
});

const passwordSchema = z
  .string()
  .min(8, { message: "leng" })
  .regex(/^(?=.*[a-z])(?=.*[A-Z]).+$/, {
    message: "case",
  })
  .regex(/^(?=.*\d)(?=.*[!@#$%^&*()_+{}|:"<>?~`\-\[\]\\';,.\/]).+$/, {
    message: "char",
  });

type FormType = z.infer<typeof loginSchema>;

function PasswordWatched({ control }: { control: Control<FormType> }) {
  const [errors, setErrors] = useState<string[]>([]);
  const password = useWatch({
    control,
    name: "password",
    defaultValue: "def",
  });

  useEffect(() => {
    if (password) {
      const res = passwordSchema.safeParse(password);
      if (!res.success) {
        setErrors(res.error.errors.map((err) => err.message));
      } else {
        setErrors([]);
      }
    }
  }, [password]);

  return (
    <Card
      className={`w-full p-2 mt-2 ${
        errors.length > 0
          ? ""
          : "bg-[var(--success-bg)] border-[var(--success-border)]"
      }`}
    >
      <ul
        className={`w-full flex flex-col gap-2 list-none ${
          errors.length > 0 ? "" : "*:before:bg-[var(--success-text)]"
        }`}
      >
        <li
          className={`${
            errors.includes("leng")
              ? "text-[var(--error-text)] before:bg-[var(--error-bg)] before:border-[var(--error-border)]"
              : "text-[var(--success-text)] before:bg-[var(--success-bg)] before:border-[var(--success-border)]"
          } flex flex-row items-center gap-2 before:inline-block before:w-4 before:h-4 before:border before:rounded-full`}
        >
          8 or more characters
        </li>
        <li
          className={`${
            errors.includes("case")
              ? "text-[var(--error-text)] before:bg-[var(--error-bg)] before:border-[var(--error-border)]"
              : "text-[var(--success-text)] before:bg-[var(--success-bg)] before:border-[var(--success-border)]"
          } flex flex-row items-center gap-2 before:inline-block before:w-4 before:h-4 before:border before:rounded-full`}
        >
          1 Uppercase and 1 lowercase letter
        </li>
        <li
          className={`${
            errors.includes("char")
              ? "text-[var(--error-text)] before:bg-[var(--error-bg)] before:border-[var(--error-border)]"
              : "text-[var(--success-text)] before:bg-[var(--success-bg)] before:border-[var(--success-border)]"
          } flex flex-row items-center gap-2 before:inline-block before:w-4 before:h-4 before:border before:rounded-full`}
        >
          1 Number and 1 special character
        </li>
      </ul>
    </Card>
  );
}

export default function LoginForm() {
  const { register, handleSubmit, control } = useForm<FormType>({
    mode: "onSubmit",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [isSignUp, setIsSignUp] = useState(false);

  async function onSubmit(e: FormValues) {
    const loading = sonner.loading(
      isSignUp ? "Signing up..." : "Logging in..."
    );
    const formData = new FormData();
    formData.set("email", e.email);
    formData.set("password", e.password);

    if (isSignUp) {
      const signupResponse = await signup(formData);
      if (!signupResponse.success) {
        sonner.error("Error signing up.", {
          id: loading,
          description: signupResponse.message,
          duration: 4000,
        });
        return;
      }
      sonner.success("Successfully signed up.", {
        id: loading,
        duration: 4000,
      });
      return redirect("/");
    }
    const loginResponse = await login(formData);
    if (!loginResponse.success) {
      sonner.error("Error logging in.", {
        id: loading,
        description: loginResponse.message,
        duration: 4000,
      });
      return;
    }
    sonner.success("Successfully logged in.", {
      id: loading,
      duration: 4000,
    });
    return redirect("/");
  }

  return (
    <Card className="w-5/6 dark md:w-3/5 justify-self-center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Log in or Sign up</CardTitle>
          <CardDescription>
            Use your email, github, or discord to sign in or create an account.
          </CardDescription>
          <div className="flex flex-row w-full gap-2 py-2">
            <Button
              onClick={async () => {
                const loading = sonner.loading("Logging into github...");
                const response = await githubSignIn();
                if (!response.success) {
                  sonner.error("Could not log in.", {
                    description: response.message,
                    id: loading,
                    duration: 4000,
                  });
                }
              }}
              type="button"
              size={"default"}
              variant={"outline"}
              className="flex flex-row w-full gap-1 p-1"
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
              onClick={async () => {
                const loading = sonner.loading("Logging into discord...");
                const response = await discordSignIn();
                if (!response.success) {
                  sonner.error("Could not log in.", {
                    description: response.message,
                    id: loading,
                    duration: 4000,
                  });
                }
              }}
              type="button"
              size={"default"}
              variant={"outline"}
              className="flex flex-row w-full gap-1 p-1"
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
            {...register("email", { required: true })}
          />
          <Label htmlFor="password" className="mt-1">
            Password:
          </Label>
          <Input
            id="password"
            type="password"
            {...register("password", { required: true })}
          />

          <PasswordWatched control={control} />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Separator />
          <FormStatus />
          <div className="flex flex-row-reverse gap-4 pt-2">
            <Button type="submit" onClick={() => setIsSignUp(false)}>
              Log in
            </Button>
            <Button
              variant={"outline"}
              type="submit"
              onClick={() => setIsSignUp(true)}
            >
              Sign up
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
