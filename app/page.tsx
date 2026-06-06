import React from "react";

export default function Home() {
  // redirect to /chat by default
  return (
    <div className="h-full flex items-center justify-center">
      <a href="/chat" className="text-white underline">
        Go to Chat
      </a>
    </div>
  );
}
