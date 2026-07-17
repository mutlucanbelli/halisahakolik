"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefreshClient() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000); // 5 saniyede bir sayfayı arkaplanda yeniler (sunucu verilerini çeker)
    
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
