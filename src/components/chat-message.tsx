interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({
  role,
  content,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? "bg-white text-black"
            : "bg-zinc-900 text-zinc-100 border border-zinc-800"
        }`}
      >
        {content}
      </div>
    </div>
  );
}