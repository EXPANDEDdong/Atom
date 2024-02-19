"use client";

import { useState } from "react";
import { SingleImageDropzone } from "./SingleImageDropzone";
import { Button } from "./ui/button";

async function handleUpload({
  avatar,
  username,
  description,
}: {
  avatar?: File;
  username?: string;
  description?: string;
}) {
  const data = new FormData();
  if (avatar) data.set("avatar", avatar);

  if (username) data.set("username", username);

  if (description) data.set("description", description);

  const res = await fetch("/api/users", {
    method: "POST",
    body: data,
  });
  if (!res.ok) {
    alert(`${res.status}: ${res.statusText}`);
    return;
  }
  alert("done");
  return;
}

export default function ProfileUpdater() {
  const [data, setData] = useState<{
    avatar?: File;
    username?: string;
    description?: string;
  }>();

  return (
    <div>
      <SingleImageDropzone
        width={200}
        height={200}
        value={data?.avatar}
        onChange={(file) => {
          setData({ avatar: file });
        }}
        dropzoneOptions={{ maxSize: 1024 * 1024 * 10 }}
      />

      <Button
        onClick={async () => {
          if (data?.avatar || data?.username || data?.description) {
            await handleUpload(data);
          }
        }}
      >
        Update
      </Button>
    </div>
  );
}
