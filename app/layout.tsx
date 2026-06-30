import type { Metadata } from "next";
import "@/src/styles/globals.css";
import AppShell from "@/src/components/AppShell";
import { ChatProvider } from "@/src/state/chat-context";

export const metadata: Metadata = {
  title: "AI Studio",
  description: "AI Studio — Advanced Intelligence",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-full flex flex-col">
        <ChatProvider>
          <AppShell>{children}</AppShell>
        </ChatProvider>
      </body>
    </html>
  );
}