"use client";

import { isAuthenticated, newPost, uploadFile } from "@/utils/actions";
import { Textarea } from "./ui/textarea";
import { createRef, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { ImagePlus, X } from "lucide-react";
import { AspectRatio } from "./ui/aspect-ratio";
import { useAddPost } from "@/utils/hooks";
import { useQueryClient } from "@tanstack/react-query";

export default function PostForm() {
  const client = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<File[]>();
  const [errors, setErrors] = useState<{ message: string }[]>([]);
  const { mutate } = useAddPost("posts", client);

  function handleImagesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files) {
      let fileArray = Array.from(files);

      if (fileArray.length > 3) {
        fileArray = fileArray.slice(0, 3);

        setErrors((prevErrors) => [
          ...prevErrors,
          { message: "Maximum of 3 files allowed." },
        ]);
      }

      const filteredFiles = fileArray.filter((file) => file.size <= 3145728);
      const oversizedFiles = fileArray.filter((file) => file.size > 3145728);

      if (oversizedFiles.length > 0) {
        fileArray = filteredFiles;

        setErrors((prevErrors) => [
          ...prevErrors,
          { message: "Maximum Filesize is 3MB." },
        ]);
      }
      setSelectedFiles(fileArray);
    }
  }

  function handleRemoveImage(file: File) {
    let fileArray = selectedFiles;
    if (fileArray) {
      const filteredArray = fileArray.filter((f) => f !== file);
      setSelectedFiles(filteredArray);
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const postData = new FormData(event.target as HTMLFormElement);
    selectedFiles?.map((file) => postData.append("images", file));

    const currentUserData = await isAuthenticated(true);

    if (!currentUserData) return;

    mutate({
      formData: postData,
      newPost: {
        id: "newPost",
        created_at: new Date().toISOString(),
        text: postData.get("text") as string,
        has_images: selectedFiles && selectedFiles.length > 0 ? true : false,
        images:
          selectedFiles && selectedFiles.length > 0
            ? selectedFiles.map((file) => URL.createObjectURL(file))
            : null,
        reply_to: [],
        replies: [],
        profiles: {
          avatar_url: currentUserData.avatar_url,
          username: currentUserData.username,
          displayname: currentUserData.displayname,
          description: currentUserData.description,
        },
        likecount: [{ count: 0 }],
        savecount: [{ count: 0 }],
        viewcount: [{ count: 0 }],
      },
    });
  }

  const ref = createRef<HTMLInputElement>();

  return (
    <div className="w-full px-1">
      <form onSubmit={handleUpload}>
        <div className="flex flex-col gap-2">
          <Textarea
            name="text"
            placeholder="Make your post..."
            className="rounded-none border-0 resize-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <div className="flex flex-row gap-2">
            {selectedFiles?.map((file, key) => (
              <div key={key} className="h-40 w-40">
                <AspectRatio ratio={2 / 2} className="relative h-full">
                  <Button
                    variant={"outline"}
                    size={"icon"}
                    className="absolute top-1 right-1 z-30"
                    type="button"
                    onClick={() => handleRemoveImage(file)}
                  >
                    <X />
                  </Button>
                  <Image
                    alt={file.name}
                    src={URL.createObjectURL(file)}
                    fill
                    className="object-cover absolute rounded-md z-20"
                  />
                </AspectRatio>
              </div>
            ))}
          </div>
          {errors && (
            <ul>
              {errors.map((err, key) => (
                <li key={key} className="text-red-500">
                  {err.message}
                </li>
              ))}
            </ul>
          )}
          <div className="w-full flex flex-row justify-between">
            <Button
              variant={"outline"}
              className="rounded-full"
              size={"icon"}
              type="button"
              onClick={() => ref.current?.click()}
            >
              <ImagePlus />
            </Button>
            <input
              type="file"
              accept="image/*"
              onChange={handleImagesChange}
              multiple
              className="hidden"
              ref={ref}
            />
            <Button variant={"outline"} type="submit">
              Submit
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
