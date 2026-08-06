import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Trash2, Key } from "lucide-react";
import PlayerEditModal from "../PlayerEditModal";
import { deletePlayer } from "../actions";
import ResetPasswordBtn from "../ResetPasswordBtn";

export default async function PlayerDetailsPage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      matches: {
        include: { match: { select: { status: true, date: true } } },
        orderBy: { match: { date: "desc" } }
      }
    }
  });

  if (!player) {
    return <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Oyuncu bulunamadı.</div>;
  }



  // Reyting rengi hesapla
  let ratingGradient = "from-emerald-500 to-emerald-400";
  let badgeColor = "bg-emerald-500";
  let lightBgColor = "bg-emerald-50";
  let borderColor = "border-emerald-200";
  if (player.rating >= 80) { 
    ratingGradient = "from-yellow-500 to-amber-400"; 
    badgeColor = "bg-amber-500"; 
    lightBgColor = "bg-amber-50";
    borderColor = "border-amber-200";
  }
  else if (player.rating < 60) { 
    ratingGradient = "from-red-500 to-rose-400"; 
    badgeColor = "bg-rose-500"; 
    lightBgColor = "bg-rose-50";
    borderColor = "border-rose-200";
  }
  else if (player.rating < 70) { 
    ratingGradient = "from-blue-500 to-sky-400"; 
    badgeColor = "bg-sky-500"; 
    lightBgColor = "bg-sky-50";
    borderColor = "border-sky-200";
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 animate-fade-in pb-24 flex flex-col gap-6 overflow-hidden">
      
      {/* Üst Kısım: Geri Butonu */}
      <div>
        <Link href="/admin/players" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm w-fit">
          <ArrowLeft size={16} /> Oyunculara Dön
        </Link>
      </div>
        
      {/* Aydınlık & Ferah Premium Profil Kartı */}
      <div className={`bg-white rounded-[28px] p-5 sm:p-7 border ${borderColor} shadow-xl shadow-gray-200/60 relative overflow-hidden flex flex-col gap-6`}>
        
        {/* Dekoratif Renkli Arka Plan */}
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${ratingGradient} opacity-10 rounded-full blur-[60px] pointer-events-none`}></div>
        <div className={`absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr ${ratingGradient} opacity-5 rounded-full blur-[80px] pointer-events-none`}></div>
        
        {/* Top Section */}
        <div className="flex justify-between items-start z-10 w-full">
          <div className="flex items-center gap-3 sm:gap-4 max-w-[70%]">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 ${badgeColor} rounded-full flex items-center justify-center font-black text-2xl text-white shadow-lg shrink-0 border-4 border-white`}>
              {player.name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="font-black text-xl sm:text-2xl text-slate-800 leading-tight truncate">{player.name}</h2>
              <span className={`inline-block mt-1 px-2.5 py-0.5 ${lightBgColor} border ${borderColor} rounded-md text-[10px] font-bold text-slate-700 uppercase tracking-widest w-fit`}>
                {player.positions}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-start gap-1">
              <span className={`text-4xl sm:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br ${ratingGradient} drop-shadow-sm`}>
                {Math.ceil(player.rating)}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">OVR</span>
            </div>
          </div>
        </div>
        
        {/* Unified Code Toolbar -> Username */}
        <div className="flex flex-row items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-3 z-10 w-full shadow-sm text-center font-mono font-bold text-slate-700">
          Kullanıcı Adı: {player.username}
        </div>
        
        
        {/* Action Buttons */}
        <div className="mt-1 flex flex-row gap-3 z-10 w-full flex-wrap">
          <div className="flex-1 min-w-[120px]">
            <PlayerEditModal player={player} />
          </div>
          <div className="flex-1 min-w-[120px]">
            <ResetPasswordBtn playerId={player.id} />
          </div>
          <form action={async () => {
            "use server";
            await deletePlayer(player.id);
          }} className="flex-1 min-w-[120px]">
            <button type="submit" className="flex items-center justify-center gap-2 h-[46px] px-5 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-500 hover:text-white transition-all shadow-sm font-bold w-full">
              <Trash2 size={16} /> Sil
            </button>
          </form>
        </div>

      </div>

      {/* Mevki Puanları (Gelecekte buraya grafik veya liste eklenebilir) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
        <h3 className="font-bold text-slate-800">Mevki Puanları</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {player.positions.includes("Kaleci") && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Kaleci (GK)</span>
              <span className="text-xl font-black text-slate-700">{player.rating_GK.toFixed(1)}</span>
            </div>
          )}
          {player.positions.includes("Defans") && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Defans (DEF)</span>
              <span className="text-xl font-black text-slate-700">{player.rating_DEF.toFixed(1)}</span>
            </div>
          )}
          {player.positions.includes("Orta Saha") && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Orta Saha (MID)</span>
              <span className="text-xl font-black text-slate-700">{player.rating_MID.toFixed(1)}</span>
            </div>
          )}
          {(player.positions.includes("Forvet") || player.positions.includes("Kanat")) && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Forvet (FWD)</span>
              <span className="text-xl font-black text-slate-700">{player.rating_FWD.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

