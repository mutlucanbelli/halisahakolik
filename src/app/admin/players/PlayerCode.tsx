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
    <div className="mt-2 flex items-center gap-2 bg-gray-100 pl-3 pr-1.5 py-1.5 rounded-lg border border-gray-200 shadow-inner">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">KOD:</span>
      <span className="text-base font-black tracking-widest text-black min-w-[70px] text-center">
        {isVisible ? code : "••••••"}
      </span>
      <div className="flex items-center gap-1 ml-2 border-l border-gray-200 pl-2">
        <button 
          onClick={() => setIsVisible(!isVisible)} 
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
          title={isVisible ? "Gizle" : "Göster"}
        >
          {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button 
          onClick={handleCopy} 
          className={`p-1.5 rounded-md transition-colors ${
            copied ? "text-emerald-600 bg-emerald-50" : "text-gray-400 hover:text-gray-700 hover:bg-gray-200"
          }`}
          title="Kodu Kopyala"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
