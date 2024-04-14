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
          className="flex flex-row rounded-full gap-4 text-muted-foreground px-6 py-2"
        >
          <Search className="justify-self-start" />
          <span>Search...</span>
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
