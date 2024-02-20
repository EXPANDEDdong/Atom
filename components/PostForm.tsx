"use client";

import { isAuthenticated, newPost, uploadFile } from "@/utils/actions";
import { Input } from "./ui/input";
import { zfd } from "zod-form-data";
import { z } from "zod";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";

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
          { message: "Maximum Filesize of 3MB." },
        ]);
      }
      setSelectedFiles(fileArray);
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const postData = new FormData(event.target as HTMLFormElement);
    selectedFiles?.map((file) => postData.append("images", file));

    await handleNewPost(postData);
  }

  return (
    <div>
      <form onSubmit={handleUpload}>
        <Textarea name="text" />
        <Input
          type="file"
          accept="image/*"
          onChange={handleImagesChange}
          multiple
        />
        {errors && (
          <ul>
            {errors.map((err, key) => (
              <li key={key}>{err.message}</li>
            ))}
          </ul>
        )}

        <Button type="submit">Submit</Button>
      </form>
      {selectedFiles?.map((file, key) => (
        <div key={key} className="h-[200px] w-[200px] overflow-hidden relative">
          <Image
            alt={file.name}
            src={URL.createObjectURL(file)}
            height={200}
            width={200}
            className="object-cover absolute"
          />
        </div>
      ))}
    </div>
  );
}
