"use client";

import React, { useState } from "react";
import { useChat } from "@/src/state/chat-context";

export function MessageInput() {
  const { sendMessage, loading } = useChat();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSend() {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await sendMessage(text);
      setText("");
    } catch (e) {
      // error handled in context
    } finally {
      setSubmitting(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void onSend();
    }
  }

  return (
    <div className="flex items-end gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <textarea
        placeholder="Message AI Studio..."
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={loading}
        className="max-h-64 min-h-[100px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-zinc-500 disabled:opacity-50"
      />

      <button
        onClick={onSend}
        disabled={submitting || !text.trim() || loading}
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white text-black transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting || loading ? "..." : "Send"}
      </button>
    </div>
  );
}

export default MessageInput;
