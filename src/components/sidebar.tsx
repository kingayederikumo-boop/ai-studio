"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Icon } from "./sidebar-icons";
import type { IconName } from "./sidebar-icons";
import { useChat } from "@/src/state/chat-context";

const items: Array<{ name: string; href: string; icon: IconName }> = [
  { name: "Chat", href: "/chat", icon: "MessageSquare" },
  { name: "GitHub", href: "/github", icon: "Github" },
  { name: "Settings", href: "/settings", icon: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname() || "/";
  const { recentSessions, loadSession } = useChat();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-zinc-800 bg-zinc-900/50 backdrop-blur">
      {/* Logo Header */}
      <div className="border-b border-zinc-800 px-6 py-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 flex-shrink-0">
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <linearGradient id="sidebarGradientA" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#00E5FF", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#2E5FFF", stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="sidebarGradientB" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#2E5FFF", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#A84EFF", stopOpacity: 1 }} />
                </linearGradient>
              </defs>

              {/* Letter A */}
              <g>
                <polygon
                  points="240,750 470,280 550,280 780,750 680,750 630,630 390,630 340,750"
                  fill="url(#sidebarGradientA)"
                  stroke="none"
                />
              </g>

              {/* Letter S/5 shape */}
              <g>
                <path
                  d="M 820 350 Q 950 350 950 420 Q 950 480 850 500 L 750 520"
                  fill="none"
                  stroke="url(#sidebarGradientB)"
                  strokeWidth="120"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 750 520 Q 850 540 950 580 Q 950 640 820 660"
                  fill="none"
                  stroke="url(#sidebarGradientB)"
                  strokeWidth="120"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 820 660 Q 700 660 700 730 Q 700 780 800 800 Q 900 820 950 800"
                  fill="none"
                  stroke="url(#sidebarGradientB)"
                  strokeWidth="120"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            AI Studio
          </h1>
        </Link>
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

        {/* Recent Chats */}
        <div className="mt-8">
          <div className="flex items-center justify-between px-4 mb-3">
            <span className="text-xs uppercase tracking-widest text-zinc-500">Recent Chats</span>
            <button onClick={() => setShowHistory(!showHistory)} className="text-zinc-400 hover:text-white text-xs">
              {showHistory ? 'Hide' : 'Show'}
            </button>
          </div>
          {showHistory && recentSessions.length > 0 && (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {recentSessions.slice(0, 5).map((session) => (
                <button
                  key={session.id}
                  onClick={() => loadSession(session.id)}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-white rounded-xl truncate"
                >
                  {session.title || 'New Chat'}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

export { Icon } from "./sidebar-icons";
