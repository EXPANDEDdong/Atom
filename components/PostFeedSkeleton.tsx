import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function PostFeedSkeleton() {
  const arr = [1, 2, 3, 4, 5];
  return (
    <main className="flex flex-col items-center w-full h-full gap-2">
      {arr.map((d, i) => (
        <Card key={i} className="w-full lg:w-1/2 sm:w-2/3">
          <CardHeader>
            <Skeleton className="h-4 w-14" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-11/12 h-4" />
            <Skeleton className="w-full h-48 mt-2 rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
