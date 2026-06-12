import type { Metadata } from "next";
import "@/src/styles/globals.css";
import AppShell from "@/src/components/AppShell";

export const metadata: Metadata = {
  title: "AI Studio",
  description: "AI Studio — Advanced Intelligence",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-full flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
