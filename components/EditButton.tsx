"use client";
import { SessionContext } from "@/app/UserContext";
import { useContext } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Pencil } from "lucide-react";

export default function EditButton({ userId }: { userId: string }) {
  const user = useContext(SessionContext);

  if (!user || user.id !== userId) return null;
  return (
    <Button variant={"outline"} className="w-fit mb-2" asChild>
      <Link href={"/settings"}>
        <Pencil /> Edit Profile
      </Link>
    </Button>
  );
}
