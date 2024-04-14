"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { MoveLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.back()}
      variant={"ghost"}
      className="rounded-full text-lg font-normal inline-flex flex-row gap-2"
    >
      <MoveLeft /> Go back to feed
    </Button>
  );
}
