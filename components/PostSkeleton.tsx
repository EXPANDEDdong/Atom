import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function PostSkeleton() {
  return (
    <div className="w-full h-full">
      <Card className="border-x-0 border-t-0 rounded-none">
        <CardHeader>
          <Skeleton className="w-40 h-4" />
        </CardHeader>
        <CardContent>
          <div className="w-full h-full flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex flex-col items-center w-full">
              <Skeleton className="h-72 w-4/6" />
            </div>
            <Skeleton className="h-4 w-72" />
          </div>
          <CardFooter className="mt-4">
            <div className="flex flex-row gap-4">
              <Skeleton className="h-12 w-28" />
              <Skeleton className="h-12 w-28" />
              <Skeleton className="h-12 w-28" />
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
