"use client";

import React, { useEffect, useRef } from "react";
import { useChat } from "@/src/state/chat-context";
import { Icon } from "./sidebar-icons";
import MessageInput from "./message-input";

export default function ChatLayout() {
  const { messages } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800">
                <Icon name="Sparkles" size={24} />
              </div>

              <h2 className="mb-2 text-2xl font-semibold">Welcome to AI Studio</h2>

              <p className="text-zinc-400">Start a conversation by typing a message below.</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-lg max-w-[80%] ${
                  m.role === "user" ? "self-end bg-white text-black" : "self-start bg-zinc-800"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                <div className="mt-1 text-xs text-zinc-500">{new Date(m.createdAt).toLocaleTimeString()}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-4xl p-4">
          <div className="flex items-end gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
            <MessageInput />
          </div>
        </div>
      </div>
    </main>
  );
}
