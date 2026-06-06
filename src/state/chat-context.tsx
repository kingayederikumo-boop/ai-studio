"use client";

import React, { createContext, useContext, useRef, useState } from "react";
import { Message } from "@/src/types";

type ChatContextType = {
  messages: Message[];
  sendMessage: (content: string) => Promise<Message>;
  clearMessages: () => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

function generateId(): string {
  try {
    // @ts-ignore
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      // @ts-ignore
      return crypto.randomUUID();
    }
  } catch (e) {
    // ignore
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const loadingRef = useRef(false);

  async function sendMessage(content: string) {
    if (!content.trim()) throw new Error("empty");

    const message: Message = {
      id: generateId(),
      role: "user",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((m) => [...m, message]);

    // Placeholder assistant response (simulate async)
    if (!loadingRef.current) {
      loadingRef.current = true;
      await new Promise((r) => setTimeout(r, 300));
      const assistant: Message = {
        id: generateId(),
        role: "assistant",
        content: "(This is a placeholder assistant response)",
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, assistant]);
      loadingRef.current = false;
    }

    return message;
  }

  function clearMessages() {
    setMessages([]);
  }

  return (
    <ChatContext.Provider value={{ messages, sendMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
