import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HalısahaKolik",
  description: "Halısaha puanlama ve takım kurma sistemi",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
    apple: [
      { url: "/icon.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
    shortcut: "/icon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${outfit.variable}`}>
      <body className="flex justify-center bg-slate-900" style={{ margin: 0, minHeight: '100dvh' }}>
        <main className="w-full max-w-[430px] bg-slate-50 relative shadow-2xl pb-28 overflow-x-hidden flex flex-col" style={{ minHeight: '100dvh' }}>
          {children}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
