import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Halısaha Pro",
  description: "Halısaha puanlama ve takım kurma sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${outfit.variable}`}>
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
