"use client";

import React, { useState } from "react";
import { useChat } from "@/src/state/chat-context";

export function MessageInput() {
  const { sendMessage } = useChat();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSend() {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await sendMessage(text);
      setText("");
    } catch (e) {
      // noop
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
    <>
      <textarea
        placeholder="Message AI Studio..."
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-zinc-500"
      />

      <button
        onClick={onSend}
        disabled={submitting}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition hover:opacity-90"
      >
        Send
      </button>
    </>
  );
}

export default MessageInput;
