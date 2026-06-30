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
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
        copied ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
      }`}
    >
      {copied ? <Check size={14} /> : <Link size={14} />}
      {copied ? "Kopyalandı" : "Konsey Linki"}
    </button>
  );
}
