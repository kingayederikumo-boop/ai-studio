"use client";

import React, { useState } from "react";
import { ChatProvider } from "@/src/state/chat-context";
import { SettingsProvider } from "@/src/state/settings-context";
import { MobileSidebar } from "@/src/components/mobile-sidebar";
import Header from "@/src/components/header";
import Splash from "@/src/components/Splash";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SettingsProvider>
      <ChatProvider>
        <div className="min-h-screen flex bg-zinc-950 text-zinc-100 justify-center">
          <div className="w-full max-w-md flex flex-col">
            <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

            <div className="flex-1 flex flex-col">
              <Header onOpenMenu={() => setMobileOpen(true)} />

              <main className="flex-1 overflow-hidden relative">{children}</main>
            </div>
          </div>
        </div>

        {/* Splash is rendered at top-level so it overlays the whole app on initial load */}
        <Splash />
      </ChatProvider>
    </SettingsProvider>
  );
}
