"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Icon } from "./sidebar-icons";

const items = [
  { name: "Chat", href: "/chat", icon: "MessageSquare" },
  { name: "GitHub", href: "/github", icon: "Github" },
  { name: "Settings", href: "/settings", icon: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname() || "/";

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-zinc-800 bg-zinc-900/50 backdrop-blur">
      <div className="border-b border-zinc-800 px-6 py-5">
        <h1 className="text-lg font-semibold">AI Studio</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((item) => {
            const active = pathname === item.href || (pathname === "/" && item.href === "/chat");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                    active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <Icon name={item.icon} size={18} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export { Icon } from "./sidebar-icons";
