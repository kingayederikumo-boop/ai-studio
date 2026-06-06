import { Sidebar } from "@/components/sidebar";
import { ChatLayout } from "@/components/chat-layout";

export default function HomePage() {
  return (
    <div className="h-screen bg-zinc-950 text-zinc-100">
      <div className="flex h-full">
        <Sidebar />
        <ChatLayout />
      </div>
    </div>
  );
}