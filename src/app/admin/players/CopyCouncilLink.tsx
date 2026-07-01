"use client";

import { Link, Check } from "lucide-react";
import { useState } from "react";

export default function CopyCouncilLink({ playerId }: { playerId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/council/${playerId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button 
      onClick={handleCopy}
      className={`flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold px-2 py-1.5 rounded-lg transition-all ${
        copied ? 'bg-emerald-50 text-emerald-600' : 'bg-transparent text-slate-600 hover:bg-slate-200/50 hover:text-slate-800'
      }`}
    >
      {copied ? <Check size={14} /> : <Link size={14} />}
      {copied ? "Kopyalandı" : "Oylama Linki"}
    </button>
  );
}
