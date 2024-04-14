import { Bell, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import Link from "next/link";
import { useNotifications } from "@/utils/hooks";

export default function NotificationButton({ userId }: { userId: string }) {
  const { unreadCount, notifications } = useNotifications();
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="relative w-fit px-0">
        {unreadCount > 0 && (
          <Badge
            className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
            variant={"secondary"}
          >
            {unreadCount > 99 ? "+99" : unreadCount}
          </Badge>
        )}

        <Bell width={48} className="w-full h-full" />
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-4 w-[250px] md:w-[400px] lg:w-[500px] lg:grid-cols-[1fr] z-110">
          {notifications.slice(0, 2).map((notif, i) => {
            return (
              <li key={i}>
                <NavigationMenuLink asChild>
                  <Link
                    href={`/post/${notif.data.post.post_id}`}
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">
                      New post by {notif.data.post.user_data.displayname}!
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      {notif.data.post.post_text}
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
            );
          })}

          <Button variant={"outline"} className="w-full" asChild>
            <Link href={"/notifications"}>View all</Link>
          </Button>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
