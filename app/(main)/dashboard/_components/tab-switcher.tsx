"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { name: "Links", href: "/dashboard" },
  { name: "Shorten Link", href: "/dashboard/link/new" },
  { name: "Settings", href: "/dashboard/settings/domains" },
];

type TabSwitcherProps = {
  className?: string;
};

const TabSwitcher = ({ className }: TabSwitcherProps) => {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex items-center border-b border-neutral-200 text-center text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-300",
        className
      )}
    >
      <ul className="-mb-px gap-2 flex flex-wrap">
        {links.map(({ name, href }) => (
          <li
            key={name}
            className={cn(
              "flex items-center justify-center px-4 py-2 border-b-2 border-transparent group",
              pathname === href && "border-primary text-primary"
            )}
          >
            <Link
              href={href}
              className="rounded-md px-2 py-1 transition group-hover:bg-neutral-900 group-hover:text-white"
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { TabSwitcher };
