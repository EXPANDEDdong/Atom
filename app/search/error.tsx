"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
    console.error(error);
  }, [error]);

  return (
    <div className="w-full h-full flex justify-center items-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">
            Something went wrong!
          </CardTitle>
          <CardDescription>
            <p>{error.message}</p>
          </CardDescription>
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
