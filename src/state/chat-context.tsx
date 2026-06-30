"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { ChatMessage } from '@/src/types/chat';

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  sendMessage: (text: string) => Promise<void>;
  loading: boolean;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: new Date(),
    };
    addMessage(userMsg);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (data.ok && data.text) {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.text,
          createdAt: new Date(),
        };
        addMessage(assistantMsg);
      } else {
        console.error('API error:', data.error);
      }
    } catch (error) {
      console.error('Send error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = () => setMessages([]);

  return (
    <ChatContext.Provider value={{ messages, addMessage, sendMessage, loading, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};