"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Search, ArrowUpDown } from "lucide-react";

type Player = {
  id: string;
  name: string;
  positions: string;
  rating: number;
  createdAt: Date;
};

export default function PlayerListClient({ initialPlayers }: { initialPlayers: Player[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "rating-desc" | "rating-asc">("newest");

  const filteredAndSorted = useMemo(() => {
    let result = [...initialPlayers];

    // 1. Filtreleme
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        p.positions.toLowerCase().includes(lowerSearch)
      );
    }

    // 2. Sıralama
    if (sortBy === "rating-desc") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "rating-asc") {
      result.sort((a, b) => a.rating - b.rating);
    } else {
      // newest (varsayılan, createdAt'e göre)
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [initialPlayers, search, sortBy]);

  return (
    <div className="flex flex-col gap-4">
      {/* Filtre ve Sıralama Çubuğu */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="İsim veya mevki ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium text-gray-800"
          />
        </div>
        <div className="relative shrink-0 sm:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <ArrowUpDown size={16} />
          </div>
          <select 
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-bold text-gray-700 appearance-none cursor-pointer"
          >
            <option value="newest">En Yeniler</option>
            <option value="rating-desc">En Yüksek Puan</option>
            <option value="rating-asc">En Düşük Puan</option>
          </select>
          {/* Custom arrow for select since appearance is none */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            <ChevronRight size={14} className="rotate-90" />
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="flex flex-col gap-3">
        {filteredAndSorted.map((player: any) => (
          <Link href={`/admin/players/${player.id}`} key={player.id} className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center cursor-pointer active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-50 rounded-full flex items-center justify-center font-black text-lg text-black group-hover:text-blue-600 border border-gray-200 group-hover:border-blue-200 transition-colors shrink-0">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="font-bold text-lg text-black leading-tight group-hover:text-blue-700 transition-colors truncate">{player.name}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider truncate">{player.positions.split(',')[0]}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black tracking-tighter text-black leading-none">{Math.ceil(player.rating)}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">OVR</span>
                </div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={20} />
            </div>
          </Link>
        ))}

        {filteredAndSorted.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <p className="text-gray-500 font-medium">Arama kriterlerine uygun oyuncu bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
