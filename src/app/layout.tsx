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
      <body className="flex justify-center min-h-screen bg-slate-900 overflow-y-scroll" style={{ margin: 0 }}>
        <main className="w-full max-w-[430px] bg-slate-50 min-h-screen relative shadow-2xl pb-24 overflow-x-hidden flex flex-col">
          {children}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
