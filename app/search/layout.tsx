"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

export default function layout({
  posts,
  users,
}: {
  posts: React.ReactNode;
  users: React.ReactNode;
}) {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="h-full lg:w-1/2 sm:w-2/3 w-full py-2">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="w-full">
              Posts
            </TabsTrigger>
            <TabsTrigger value="users" className="w-full">
              Users
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts">{posts}</TabsContent>
          <TabsContent value="users">{users}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
