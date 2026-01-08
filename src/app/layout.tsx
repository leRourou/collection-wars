import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { auth } from "@/lib/auth/auth";
import "./globals.css";
import { LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LoginButton from "./_components/login-button";
import { ThemeToggle } from "@/components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Collection Wars",
  description: "Collection trading card game",
};

/**
 * Récupère la session côté serveur et la passe au provider client
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <nav className="p-4 border-b">
              <div className="container mx-auto flex justify-between items-center">
                <Link href="/">
                  <h1 className="text-lg font-bold">Collection Wars</h1>
                </Link>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/dashboard">
                        <Button
                          size="icon-lg"
                          aria-label="Submit"
                          variant="default"
                        >
                          <LayoutDashboardIcon />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tableau de bord</p>
                    </TooltipContent>
                  </Tooltip>
                  <LoginButton />
                </div>
              </div>
            </nav>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
