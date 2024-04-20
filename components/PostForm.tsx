"use client";

import { isAuthenticated } from "@/utils/actions";
import { Textarea } from "./ui/textarea";
import { createRef, useContext, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { ImagePlus, X } from "lucide-react";
import { AspectRatio } from "./ui/aspect-ratio";
import { useAddPost } from "@/utils/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { SessionContext } from "@/app/UserContext";
import { toast } from "sonner";
import { z } from "zod";

const textSchema = z
  .string()
  .min(3, "Text must be 3 or more characters.")
  .max(500, "Text must be 500 characters or less.")
  .refine(
    (text) => {
      const newlineRegex = /\n/g;

      const newlineCount = (text.match(newlineRegex) || []).length;

      return newlineCount <= 10;
    },
    {
      message: "Text not allowed to have more than 10 newlines.",
    }
  );

export default function PostForm({
  replyToId,
  queryKey,
}: {
  replyToId: string | null;
  queryKey: string[];
}) {
  const client = useQueryClient();
  const user = useContext(SessionContext);
  const [selectedFiles, setSelectedFiles] = useState<File[]>();
  const [errors, setErrors] = useState<{ message: string }[]>([]);
  const { mutate, isPending } = useAddPost(queryKey, client);

  const ref = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

    formRef.current?.reset();
    setSelectedFiles(undefined);

    if (!user) {
      toast("You must be logged in to post", {
        closeButton: true,
      });
      return;
    }

    const postText = postData.get("text") as string;

    const validateText = textSchema.safeParse(postText);

    if (!validateText.success) {
      validateText.error.errors.map((err) => {
        setErrors((prev) => {
          if (prev.includes({ message: err.message })) {
            return prev;
          }
          return [...prev, { message: err.message }];
        });
      });

      return;
    }

    mutate({
      formData: postData,
      newPost: {
        id: "posting",
        created_at: new Date().toISOString(),
        text: postText,
        has_images: selectedFiles && selectedFiles.length > 0 ? true : false,
        images:
          selectedFiles && selectedFiles.length > 0
            ? selectedFiles.map((file) => URL.createObjectURL(file))
            : null,
        reply_to: replyToId,
        reply_count: 0,
        profiles: {
          author_id: user.id,
          avatar_url: user.user_metadata.profile_avatar_url,
          username: user.user_metadata.username,
          displayname: user.user_metadata.displayname,
          description: user.user_metadata.description,
        },
        likecount: 0,
        savecount: 0,
        viewcount: 0,
        has_liked: false,
        has_saved: false,
        has_viewed: false,
      },
      isReply: !!replyToId,
      replyToId,
    });
  }

  return (
    <div className="w-full px-1">
      <form onSubmit={handleUpload} ref={formRef}>
        <div className="flex flex-col gap-2">
          <Textarea
            name="text"
            placeholder="Make your post..."
            required
            className="border-0 rounded-none resize-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <div className="flex flex-row gap-2">
            {selectedFiles?.map((file, key) => (
              <div key={key} className="w-40 h-40">
                <AspectRatio ratio={2 / 2} className="relative h-full">
                  <Button
                    variant={"outline"}
                    size={"icon"}
                    className="absolute z-30 top-1 right-1"
                    type="button"
                    onClick={() => handleRemoveImage(file)}
                  >
                    <X />
                  </Button>
                  <Image
                    alt={file.name}
                    src={URL.createObjectURL(file)}
                    fill
                    sizes="(max-width: 768px) 40vw, (max-width: 1200px) 30vw, 25vw"
                    className="absolute z-20 object-cover rounded-md"
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
          <div className="flex flex-row justify-between w-full">
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
            <Button variant={"outline"} type="submit" disabled={isPending}>
              Submit
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
