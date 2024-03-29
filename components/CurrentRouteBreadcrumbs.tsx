"use client";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Slash, SlashIcon } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

export default function CurrentRouteBreadcrumbs() {
  const path = usePathname()
    .split("/")
    .filter((part) => part !== "");

  const crumbs = path.map((segment, i) => {
    let link = null;
    if (segment !== "user" && segment !== "post") {
      link = path.slice(0, i + 1).join("/");
    }

    return {
      crumbText: segment,
      crumbLink: link,
    };
  });

  crumbs.unshift({
    crumbText: "home",
    crumbLink: "/",
  });

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-lg">
        {crumbs.map((crumb, i) => (
          <Fragment key={i}>
            {i !== 0 && (
              <BreadcrumbSeparator>
                <Slash />
              </BreadcrumbSeparator>
            )}
            <BreadcrumbItem>
              {i === crumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.crumbText}</BreadcrumbPage>
              ) : (
                <>
                  {crumb.crumbLink === null ? (
                    <span>{crumb.crumbText}</span>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={`/${crumb.crumbLink}`}>
                        {crumb.crumbText}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </>
              )}
            </BreadcrumbItem>
            {crumbs.length === 1 && (
              <BreadcrumbSeparator>
                <Slash />
              </BreadcrumbSeparator>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
