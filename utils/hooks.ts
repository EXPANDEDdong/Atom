import { zfd } from "zod-form-data";
import {
  PostSelectReturn,
  isAuthenticated,
  newPost,
  uploadFile,
} from "./actions";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { z } from "zod";

const newPostSchema = zfd.formData({
  text: zfd.text(),
  images: zfd.repeatableOfType(zfd.file(z.instanceof(File))).optional(),
});

async function handleNewPost(formData: FormData) {
  console.log("1");
  const isLoggedIn = await isAuthenticated(false);
  console.log(isLoggedIn);
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
  console.log(result);
  console.timeLog("post", "Posted.");
  console.timeEnd("post");
  return result;
}

export function useAddPost(queryKey: string, queryClient: QueryClient) {
  return useMutation({
    mutationFn: async ({
      newPost,
      formData,
    }: {
      newPost: PostSelectReturn[number];
      formData: FormData;
    }) => {
      console.log("yeah");
      return await handleNewPost(formData);
    },
    onMutate: async ({ newPost }) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] });

      const previousPosts = queryClient.getQueryData([queryKey]);

      queryClient.setQueryData(
        [queryKey],
        (old: {
          pageParams: Array<number>;
          pages: Array<{
            data: PostSelectReturn;
            nextPage: number;
            previousPage: number;
          }>;
        }) => {
          return {
            ...old,
            pages: [
              {
                data: [newPost, ...old.pages[0].data],
                nextPage: old.pages[0].nextPage,
                previousPage: old.pages[0].previousPage,
              },
              ...old.pages.slice(1), // Keep the rest of the pages unchanged
            ],
          };
        }
      );

      return { previousPosts };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    mutationKey: ["addPost"],
  });
}
