"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff, Check } from "lucide-react";

export default function PlayerCode({ code }: { code: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex items-center justify-center gap-1.5 pl-1">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">KOD:</span>
      <span className="text-xs font-black tracking-widest text-slate-700 w-[46px] text-center">
        {isVisible ? code : "••••••"}
      </span>
      <div className="flex items-center ml-1">
        <button 
          onClick={() => setIsVisible(!isVisible)} 
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-md transition-colors"
          title={isVisible ? "Gizle" : "Göster"}
        >
          {isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
        <button 
          onClick={handleCopy} 
          className={`p-1.5 rounded-md transition-colors ${
            copied ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
          title="Kodu Kopyala"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  );
}
