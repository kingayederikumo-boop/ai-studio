"use client";

import { SendHorizonal } from "lucide-react";

export function MessageInput() {
  return (
    <div className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-end gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
          <textarea
            placeholder="Message AI Studio..."
            rows={1}
            className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-zinc-500"
          />

          <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition hover:opacity-90">
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}