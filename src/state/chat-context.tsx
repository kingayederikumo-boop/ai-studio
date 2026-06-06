"use client";

import React, { createContext, useContext, useRef, useState } from "react";
import { Message } from "@/src/types";
import { v4 as uuid } from "uuid";

type ChatContextType = {
  messages: Message[];
  sendMessage: (content: string) => Promise<Message>;
  clearMessages: () => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const loadingRef = useRef(false);

  async function sendMessage(content: string) {
    if (!content.trim()) throw new Error("empty");

    const message: Message = {
      id: uuid(),
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
        id: uuid(),
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
