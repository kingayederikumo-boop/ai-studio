"use client";

import { Icon } from "./sidebar";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({
  open,
  onClose,
}: MobileSidebarProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
      />

      <aside className="fixed left-0 top-0 z-50 h-full w-72 border-r border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 p-5">
          <h2 className="font-semibold">AI Studio</h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-zinc-800"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button className="flex w-full items-center gap-3 rounded-xl bg-zinc-800 px-4 py-3">
            <Icon name="MessageSquare" size={18} />
            Chat
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-zinc-400 hover:bg-zinc-800">
            <Icon name="Github" size={18} />
            GitHub
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-zinc-400 hover:bg-zinc-800">
            <Icon name="Settings" size={18} />
            Settings
          </button>
        </nav>
      </aside>
    </>
  );
}
