import { Header } from "./header";
import { EmptyState } from "./empty-state";
import { MessageInput } from "./message-input";

export function ChatLayout() {
  const messages: any[] = [];

  return (
    <main className="flex flex-1 flex-col">
      <Header />

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
            {/* Message list goes here */}
          </div>
        )}
      </div>

      <MessageInput />
    </main>
  );
}