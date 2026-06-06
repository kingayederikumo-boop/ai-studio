import { Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800">
          <Sparkles size={24} />
        </div>

        <h2 className="mb-2 text-2xl font-semibold">
          Welcome to AI Studio
        </h2>

        <p className="text-zinc-400">
          Start a conversation by typing a message below.
        </p>
      </div>
    </div>
  );
}