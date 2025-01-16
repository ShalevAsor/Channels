import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { ModalProvider } from "@/components/providers/modal-provider";
import { SessionProvider } from "next-auth/react";
import { PusherProvider } from "@/components/providers/pusher-provider";
import { QueryProvider } from "@/components/providers/query-provider";
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Channels",
  description: "Discord clone",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          `${openSans.variable} ${geistSans.variable} ${geistMono.variable} antialiased`,
          "bg-white dark:bg-[#313338] h-full"
        )}
      >
        <SessionProvider>
          <div>
            <Toaster />
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              storageKey="discord-theme"
            >
              <PusherProvider>
                <ModalProvider />
                <QueryProvider>{children}</QueryProvider>
              </PusherProvider>
            </ThemeProvider>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
