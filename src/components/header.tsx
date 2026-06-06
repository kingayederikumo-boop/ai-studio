"use client";

import { Menu } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 hover:bg-zinc-800 md:hidden">
          <Menu size={20} />
        </button>

        <h1 className="text-lg font-semibold">AI Studio</h1>
      </div>
    </header>
  );
}