import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TwinMind | AI Meeting Copilot",
  description: "Real-time AI suggestions and meeting assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${outfit.className} bg-zinc-950 text-slate-200 antialiased h-full flex flex-col`}>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
