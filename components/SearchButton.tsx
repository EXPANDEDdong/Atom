"use client";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchButton() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          size={"default"}
          className="flex flex-row gap-4 px-2 rounded-full sm:px-6 sm:py-2 w-fit sm:text-muted-foreground"
        >
          <Search className="justify-self-start" />
          <span className="hidden sm:inline-block">Search...</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-transparent border-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/search?q=${query}`);
            setOpen(false);
            setQuery("");
          }}
        >
          <div className="w-full">
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full my-6"
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
