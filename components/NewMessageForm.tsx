"use client";
import { newMessage } from "@/app/testing/actions";
import { useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function NewMessageForm({
  chatId,
  currentUser,
}: {
  chatId: string;
  currentUser: string;
}) {
  const newMessageBind = newMessage.bind(null, chatId, currentUser);

  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        ref.current?.reset();
        await newMessageBind(formData);
      }}
      ref={ref}
    >
      <div className="w-full flex flex-row gap-2">
        <Input type="text" name="content" required className="grow" />
        <Button type="submit" className="grow-0">
          Send
        </Button>
      </div>
    </form>
  );
}
