"use client";

import React from "react";
import { User } from "lucide-react";

interface Player {
  id: string;
  name: string;
  rating: number;
  positions: string;
}

export default function PitchView({ teamA, teamB }: { teamA: Player[], teamB: Player[] }) {
  const categorize = (players: Player[]) => {
    const def: Player[] = [];
    const mid: Player[] = [];
    const att: Player[] = [];
    const gk: Player[] = []; 

    players.forEach(p => {
      const pos = p.positions.toLowerCase();
      if (pos.includes("kaleci") || pos.includes("gk")) gk.push(p);
      else if (pos.includes("defans") || pos.includes("stoper") || pos.includes("bek")) def.push(p);
      else if (pos.includes("orta saha") || pos.includes("kanat")) mid.push(p);
      else if (pos.includes("forvet") || pos.includes("santrfor")) att.push(p);
      else mid.push(p); 
    });

    return { gk, def, mid, att };
  };

  const aGroup = categorize(teamA);
  const bGroup = categorize(teamB);

  const getPositionAbbr = (posString: string) => {
    const pos = posString.toLowerCase();
    if (pos.includes("kaleci") || pos.includes("gk")) return "KL";
    if (pos.includes("defans") || pos.includes("stoper") || pos.includes("bek")) return "DEF";
    if (pos.includes("orta saha") || pos.includes("kanat")) return "OS";
    if (pos.includes("forvet") || pos.includes("santrfor")) return "FV";
    return posString.substring(0, 3).toUpperCase();
  };

  const renderPlayer = (p: Player, teamColor: "blue" | "red") => (
    <div key={p.id} className="flex flex-col items-center justify-center group relative z-10 transition-transform hover:scale-110 cursor-pointer hover:z-20">
      <div className={`relative w-9 h-[52px] sm:w-14 sm:h-20 rounded-md flex flex-col items-center p-0.5 border border-white/30 shadow-xl backdrop-blur-md overflow-hidden ${
        teamColor === "blue" 
          ? "bg-gradient-to-b from-blue-900/90 to-blue-500/80 border-blue-300/40 shadow-blue-900/60" 
          : "bg-gradient-to-b from-red-900/90 to-red-500/80 border-red-300/40 shadow-red-900/60"
      }`}>
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-10 sm:h-10 rounded-full blur-xl ${teamColor === "blue" ? "bg-blue-300/60" : "bg-red-300/60"}`}></div>
        
        <div className="w-full flex justify-between items-start px-0.5 mt-[1px] relative z-10">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] sm:text-[14px] font-black text-yellow-300 tracking-tighter leading-none" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}>
              {Math.ceil(p.rating)}
            </span>
            <span className="text-[5px] sm:text-[7px] font-bold text-white/90 leading-none mt-[1px] uppercase">
              {getPositionAbbr(p.positions)}
            </span>
          </div>
          <div className="opacity-90 mt-[1px]">
            <User size={9} className="text-white drop-shadow-md sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="mt-auto w-full border-t border-white/30 pt-[1px] pb-[2px] relative z-10 bg-black/40">
          <span className="block text-center text-[6px] sm:text-[8px] font-bold text-white tracking-tight uppercase truncate px-0.5" style={{ textShadow: "0 1px 2px rgba(0,0,0,1)" }}>
            {p.name.split(" ")[0]}
          </span>
        </div>
      </div>
    </div>
  );

  const renderRow = (players: Player[], teamColor: "blue" | "red") => (
    <div className="w-full flex justify-around items-center px-1 sm:px-6">
      {players.map(p => renderPlayer(p, teamColor))}
    </div>
  );

  return (
    <div className="w-full aspect-[9/16] sm:aspect-[2/3] max-h-[700px] bg-emerald-600 rounded-3xl relative overflow-hidden shadow-xl shadow-black/10 border-[6px] sm:border-[8px] border-emerald-800 p-1 sm:p-2 mx-auto">
      {/* Çim Desenleri */}
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`w-full flex-1 ${i % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}></div>
        ))}
      </div>

      {/* Saha Çizgileri */}
      <div className="absolute inset-3 sm:inset-4 border-2 border-white/50 rounded-lg pointer-events-none"></div>
      
      {/* Orta Çizgi */}
      <div className="absolute top-1/2 left-3 right-3 sm:left-4 sm:right-4 h-0 border-t-2 border-white/50 pointer-events-none -translate-y-[1px]"></div>
      
      {/* Orta Yuvarlak */}
      <div className="absolute top-1/2 left-1/2 w-16 h-16 sm:w-20 sm:h-20 border-2 border-white/50 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/70 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      {/* Üst Ceza Sahası */}
      <div className="absolute top-3 sm:top-4 left-1/2 w-24 sm:w-32 h-12 sm:h-16 border-2 border-t-0 border-white/50 -translate-x-1/2 pointer-events-none"></div>
      <div className="absolute top-3 sm:top-4 left-1/2 w-12 sm:w-16 h-4 sm:h-6 border-2 border-t-0 border-white/50 -translate-x-1/2 pointer-events-none"></div>
      <div className="absolute top-15 sm:top-16 left-1/2 w-16 sm:w-20 h-8 sm:h-10 border-2 border-white/50 rounded-b-full -translate-x-1/2 pointer-events-none clip-half-bottom opacity-50" style={{ clipPath: 'inset(0 0 50% 0)' }}></div>

      {/* Alt Ceza Sahası */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 w-24 sm:w-32 h-12 sm:h-16 border-2 border-b-0 border-white/50 -translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 w-12 sm:w-16 h-4 sm:h-6 border-2 border-b-0 border-white/50 -translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-15 sm:bottom-16 left-1/2 w-16 sm:w-20 h-8 sm:h-10 border-2 border-white/50 rounded-t-full -translate-x-1/2 pointer-events-none opacity-50" style={{ clipPath: 'inset(50% 0 0 0)' }}></div>

      {/* OYUNCULAR */}
      <div className="absolute inset-0 flex flex-col py-4 sm:py-6">
        {/* Yarı 1: Takım B (Kırmızı) - Yukarıdan Aşağıya */}
        <div className="h-1/2 flex flex-col justify-evenly">
          {bGroup.gk.length > 0 && <div className="flex items-center justify-center">{renderRow(bGroup.gk, "red")}</div>}
          {bGroup.def.length > 0 && <div className="flex items-center justify-center">{renderRow(bGroup.def, "red")}</div>}
          {bGroup.mid.length > 0 && <div className="flex items-center justify-center">{renderRow(bGroup.mid, "red")}</div>}
          {bGroup.att.length > 0 && <div className="flex items-center justify-center">{renderRow(bGroup.att, "red")}</div>}
        </div>

        {/* Yarı 2: Takım A (Mavi) - Aşağıdan Yukarıya */}
        <div className="h-1/2 flex flex-col justify-evenly">
          {aGroup.att.length > 0 && <div className="flex items-center justify-center">{renderRow(aGroup.att, "blue")}</div>}
          {aGroup.mid.length > 0 && <div className="flex items-center justify-center">{renderRow(aGroup.mid, "blue")}</div>}
          {aGroup.def.length > 0 && <div className="flex items-center justify-center">{renderRow(aGroup.def, "blue")}</div>}
          {aGroup.gk.length > 0 && <div className="flex items-center justify-center">{renderRow(aGroup.gk, "blue")}</div>}
        </div>
      </div>
    </div>
  );
}
