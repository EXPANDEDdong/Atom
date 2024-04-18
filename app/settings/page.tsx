"use server";

import UpdateProfile from "@/components/UpdateProfile";
import SignOutButton from "@/components/SignOutButton";

export default async function Settings() {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <section className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold">
          Update your profile information
        </h2>
        <UpdateProfile />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold">Sign out</h2>
        <SignOutButton />
      </section>
    </div>
  );
}
