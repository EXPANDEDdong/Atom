import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function PostFeedSkeleton() {
  const arr = [1, 2, 3, 4, 5];
  return (
    <main className="w-full h-full flex flex-col gap-2">
      {arr.map((d, i) => (
        <Card key={i} className="w-full">
          <CardHeader>
            <Skeleton className="h-4 w-14" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-11/12 h-4" />
            <Skeleton className="w-full rounded-lg h-48 mt-2" />
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
