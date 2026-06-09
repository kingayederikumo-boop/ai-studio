"use client";

import React, { createContext, useContext, useState } from "react";
import { Message } from "@/src/types/index";
import { useSettings } from "./settings-context";

type ChatContextType = {
  messages: Message[];
  sendMessage: (content: string) => Promise<Message>;
  clearMessages: () => void;
  loading: boolean;
  error?: string;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const { settings } = useSettings();

  async function sendMessage(content: string) {
    if (!content.trim()) throw new Error("empty");

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((m) => [...m, userMessage]);
    setLoading(true);
    setError(undefined);

    try {
      const provider = settings.architectureProvider === "Nvidia" ? "nvidia" : "openai";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content, provider }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Unknown error");
        const errorMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: `Error: ${data.error || "Unknown error"}`,
          createdAt: new Date().toISOString(),
        };
        setMessages((m) => [...m, errorMessage]);
      } else {
        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: data.text || "No response received",
          createdAt: new Date().toISOString(),
        };
        setMessages((m) => [...m, assistantMessage]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: `Error: ${errorMsg}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, errorMessage]);
    } finally {
      setLoading(false);
    }

    return userMessage;
  }

  function clearMessages() {
    setMessages([]);
    setError(undefined);
  }

  return (
    <ChatContext.Provider value={{ messages, sendMessage, clearMessages, loading, error }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
