import type { Metadata } from "next";
import { Instrument_Serif, Sora } from "next/font/google";
import "./globals.css";
import { ShellBoundary } from "@/app/_components/shell-boundary";

const displayFont = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400"],
});

const uiFont = Sora({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BorderSafe",
  description: "AI-assisted escrow for inter-state trade in Nigeria with human fallback and wallet payouts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${uiFont.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-(--canvas) text-foreground">
        <ShellBoundary>{children}</ShellBoundary>
      </body>
    </html>
  );
}
