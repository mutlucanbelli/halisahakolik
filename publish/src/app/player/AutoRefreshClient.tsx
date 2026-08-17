"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Sadece oylama aktifken (hasVoting=true) ve daha sık yenilensin
export default function AutoRefreshClient({ hasVoting }: { hasVoting?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    // Oylama yoksa 20 saniye, varsa 3 saniyede bir yenile
    const interval = setInterval(() => {
      router.refresh();
    }, hasVoting ? 3000 : 20000);
    
    return () => clearInterval(interval);
  }, [router, hasVoting]);

  return null;
}
