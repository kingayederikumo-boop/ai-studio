import type { Metadata } from "next";
import "@/src/styles/globals.css";
import AppShell from "@/src/components/AppShell";

export const metadata: Metadata = {
  title: "AI Studio",
  description: "AI Studio — foundation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
