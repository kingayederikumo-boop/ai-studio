"use client";

import React from "react";
import ChatLayout from "@/src/components/chat-layout";
import MessageInput from "@/src/components/message-input";

export default function ChatPage() {
  return (
    <div className="flex h-screen flex-col">
      <ChatLayout />
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-end gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}
