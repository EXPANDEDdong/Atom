"use client";

import {
  PostSelectReturn,
  isAuthenticated,
  newPost,
  uploadFile,
} from "@/utils/actions";
import { Input } from "./ui/input";
import { zfd } from "zod-form-data";
import { z } from "zod";
import { Textarea } from "./ui/textarea";
import { createRef, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { ImagePlus, X } from "lucide-react";
import { AspectRatio } from "./ui/aspect-ratio";
// import { useMutation, useQueryClient } from "@tanstack/react-query";

const newPostSchema = zfd.formData({
  text: zfd.text(),
  images: zfd.repeatableOfType(zfd.file(z.instanceof(File))).optional(),
});

async function handleNewPost(formData: FormData) {
  const isLoggedIn = await isAuthenticated();
  if (!isLoggedIn) {
    return "Not logged in.";
  }
  console.time("post");
  const postData = newPostSchema.safeParse(formData);
  if (!postData.success) return;

  const newFormData = new FormData();
  newFormData.set("text", postData.data.text);

  if (postData.data.images) {
    const promises = postData.data.images.map((file, i) => {
      return new Promise((resolve: (value: string) => any, reject) => {
        const fileFormData = new FormData();
        fileFormData.set("image", file);
        uploadFile(fileFormData)
          .then((result) => {
            console.timeLog("post", `File ${i + 1} done.`);
            resolve(result);
          })
          .catch((err) => {
            reject(err);
          });
      });
    });

    console.timeLog("post", "Start promises.");

    const uploadImagesSuccess: boolean = await Promise.all(promises)
      .then((result) => {
        result.map((url) => newFormData.append("images", url));
        return true;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });

    if (!uploadImagesSuccess) {
      console.timeLog("post", "One or more promises rejected.");
      console.timeEnd("post");
      return "Failed images upload.";
    }
    console.timeLog("post", "All promises finished.");
  }

  const result = await newPost(newFormData);
  console.timeLog("post", "Posted.");
  console.timeEnd("post");
  return result;
}

export default function PostForm() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>();
  const [errors, setErrors] = useState<{ message: string }[]>([]);

  // const queryClient = useQueryClient();

  // const { mutate } = useMutation({
  //   mutationFn: ({
  //     newPost,
  //     formData,
  //   }: {
  //     newPost: PostSelectReturn[number];
  //     formData: FormData;
  //   }) => handleNewPost(formData),
  //   onSettled: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  //   mutationKey: ["mposts"],
  // });

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

    await handleNewPost(postData);
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

          {errors && (
            <ul>
              {errors.map((err, key) => (
                <li key={key}>{err.message}</li>
              ))}
            </ul>
          )}
        </div>
      </form>
    </div>
  );
}
