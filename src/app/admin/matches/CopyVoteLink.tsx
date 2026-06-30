"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyVoteLink({ matchId }: { matchId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/vote/${matchId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
        copied 
          ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
      }`}
      title="Oylama Linkini Kopyala"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Kopyalandı" : "Linki Kopyala"}
    </button>
  );
}
