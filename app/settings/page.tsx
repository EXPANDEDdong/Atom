"use server";

import { Input } from "@/components/ui/input";
import { cropAndUploadAvatar } from "./actions";
import { Button } from "@/components/ui/button";

export default async function page() {
  return (
    <div>
      <div className="h-24"></div>
      <form action={cropAndUploadAvatar}>
        <Input type="file" name="avatar" />
        <Button type="submit">test</Button>
      </form>
    </div>
  );
}
