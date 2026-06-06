import { MessageSquare, Github, Settings } from "lucide-react";

const items = [
  {
    name: "Chat",
    icon: MessageSquare,
    active: true,
  },
  {
    name: "GitHub",
    icon: Github,
  },
  {
    name: "Settings",
    icon: Settings,
  },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-zinc-800 bg-zinc-900/50 backdrop-blur">
      <div className="border-b border-zinc-800 px-6 py-5">
        <h1 className="text-lg font-semibold">AI Studio</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <button
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                    item.active
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}