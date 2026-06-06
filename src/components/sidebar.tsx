"use client";

const items = [
  {
    name: "Chat",
    icon: "MessageSquare",
    active: true,
  },
  {
    name: "GitHub",
    icon: "Github",
  },
  {
    name: "Settings",
    icon: "Settings",
  },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const iconProps = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 };
  
  switch (name) {
    case "MessageSquare":
      return (
        <svg {...iconProps}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      );
    case "Github":
      return (
        <svg {...iconProps}>
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
        </svg>
      );
    case "Settings":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6m-16.78 7.78l4.24-4.24m5.08-5.08l4.24-4.24"></path>
        </svg>
      );
    case "Menu":
      return (
        <svg {...iconProps}>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      );
    case "Sparkles":
      return (
        <svg {...iconProps}>
          <path d="M11.5 1.5L14 7l5.5 1.5L15 12.5l2.5 5.5L11.5 16l-5.5 1.5L8 12.5 3 10l5.5-1.5L11.5 3z"></path>
          <path d="M3 20h4M18 4l2-1v3M22 6l-1 2v2"></path>
        </svg>
      );
    case "SendHorizonal":
      return (
        <svg {...iconProps}>
          <polyline points="22 2 11 13 22 24 22 2"></polyline>
          <polyline points="22 2 11 13 2 9"></polyline>
        </svg>
      );
    case "X":
      return (
        <svg {...iconProps}>
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      );
    default:
      return null;
  }
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-zinc-800 bg-zinc-900/50 backdrop-blur">
      <div className="border-b border-zinc-800 px-6 py-5">
        <h1 className="text-lg font-semibold">AI Studio</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((item) => {
            return (
              <li key={item.name}>
                <button
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                    item.active
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <Icon name={item.icon} size={18} />
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

export { Icon };
