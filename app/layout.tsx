import type { Metadata } from "next";
import { Instrument_Serif, Sora } from "next/font/google";
import "./globals.css";

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
  description: "AI-assisted escrow for cross-border trade with human fallback and wallet payouts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${uiFont.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-(--canvas) text-foreground">
        <div className="relative mx-auto min-h-dvh w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
