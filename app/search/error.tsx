"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Card>
        <CardHeader>
          <CardTitle>Something went wrong!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-normal">{error.message}</p>
        </CardContent>
        <CardFooter className="flex flex-row justify-center">
          <Button onClick={() => reset()} variant={"secondary"}>
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
