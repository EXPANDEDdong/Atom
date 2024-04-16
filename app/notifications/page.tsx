"use client";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/utils/hooks";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { produce } from "immer";
import { useState, useEffect } from "react";
import { readAllNotifications } from "./actions";

export default function Notifications() {
  const { notifications } = useNotifications();
  const [markedAsRead, setMarkedAsRead] = useState(false);
  const [notificationsState, setNotificationsState] = useState(notifications);

  useEffect(() => {
    if (notifications) {
      setNotificationsState(notifications);
    }
  }, [notifications]);

  const markAllAsRead = () => {
    if (!markedAsRead) {
      const updatedNotifications = produce(
        notificationsState,
        (draftNotifications) => {
          draftNotifications.forEach((notification) => {
            notification.read = true;
          });
        }
      );
      setNotificationsState(updatedNotifications);
      setMarkedAsRead(true);
    }
  };
  return (
    <div className="w-full flex flex-col gap-2 py-2">
      <h2 className="font-semibold text-4xl text-center mt-1 mb-2">
        Notifcations
      </h2>
      <Button
        variant={"secondary"}
        onClick={async () => {
          markAllAsRead();
          await readAllNotifications();
        }}
      >
        Mark all as read
      </Button>
      {notificationsState.map((notif, i) => {
        return (
          <Button
            variant={"outline"}
            className={`flex flex-col gap-2 w-full h-fit items-start px-6 py-4 ${
              notif.read ? "" : "border-sky-400"
            }`}
            key={i}
            asChild
          >
            <Link href={`/post/${notif.data.post.post_id}`}>
              <div className="flex flex-row gap-2">
                <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={
                      notif.data.post.user_data.avatar_url ||
                      "https://wjucegfkshgallheqlzz.supabase.co/storage/v1/object/public/images/avatars/no-profile-picture-icon.webp"
                    }
                    alt={`User avatar`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h5 className="text-lg font-medium leading-none">
                    New post by {notif.data.post.user_data.displayname}!
                  </h5>
                  <p className="text-muted-foreground font-normal">
                    @{notif.data.post.user_data.username}
                  </p>
                </div>
              </div>
              <Separator />
              <p className="line-clamp-2 text-base font-normal leading-snug text-muted-foreground max-w-full text-wrap">
                {notif.data.post.post_text}
              </p>
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
