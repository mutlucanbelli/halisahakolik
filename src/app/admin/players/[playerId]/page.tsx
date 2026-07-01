import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Trash2, Award } from "lucide-react";
import DeleteVoteButton from "./DeleteVoteButton";
import PlayerEditModal from "../PlayerEditModal";
import CopyCouncilLink from "../CopyCouncilLink";
import PlayerCode from "../PlayerCode";
import { deletePlayer } from "../actions";

export default async function PlayerDetailsPage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;

  const player = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!player) {
    return <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Oyuncu bulunamadı.</div>;
  }

  // Başkalarından aldığı oylar (Genel Konsey)
  const receivedVotes = await prisma.councilVote.findMany({
    where: { targetId: playerId },
    include: { voter: true },
    orderBy: { createdAt: 'desc' }
  });

  // Başkalarına verdiği oylar (Genel Konsey)
  const givenVotes = await prisma.councilVote.findMany({
    where: { voterId: playerId },
    include: { target: true },
    orderBy: { createdAt: 'desc' }
  });

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
        
        {/* Unified Code & Link Toolbar */}
        <div className="flex flex-row items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1 z-10 w-full mt-[-4px] shadow-sm">
          <PlayerCode code={player.code} />
          <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
          <CopyCouncilLink playerId={player.id} />
        </div>
        
        {/* Detailed Stats Grid - Light & Clean */}
        <div className={`z-10 ${lightBgColor} rounded-2xl p-4 border ${borderColor}`}>
          <div className="flex items-center gap-2 mb-3">
            <Award size={14} className="text-slate-400" />
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Alt Özellikler</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <BrightStatCard label="PAC" value={player.pace} />
            <BrightStatCard label="SHO" value={player.shooting} />
            <BrightStatCard label="PAS" value={player.passing} />
            <BrightStatCard label="DRI" value={player.dribbling} />
            <BrightStatCard label="DEF" value={player.defending} />
            <BrightStatCard label="PHY" value={player.physical} />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-1 flex flex-row gap-3 z-10 w-full">
          <div className="flex-1">
            <PlayerEditModal player={player} />
          </div>
          <form action={async () => {
            "use server";
            await deletePlayer(player.id);
          }} className="flex-1">
            <button type="submit" className="flex items-center justify-center gap-2 h-[46px] px-5 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-500 hover:text-white transition-all shadow-sm font-bold w-full">
              <Trash2 size={16} /> Sil
            </button>
          </form>
        </div>

      </div>

      {/* Oylama Geçmişi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        
        {/* Aldığı Oylar Listesi */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1 px-1">
            <TrendingUp className="text-emerald-500" size={18} />
            <h2 className="font-bold text-base text-black">Aldığı Oylar</h2>
          </div>
          
          {receivedVotes.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl text-center text-xs text-gray-400 py-6">Henüz oy almamış.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {receivedVotes.map(vote => (
                <div key={vote.id} className="bg-white border border-gray-100 p-3 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 truncate">
                      <Clock size={10} /> {vote.createdAt.toLocaleDateString('tr-TR')}
                    </span>
                    <span className="text-xs font-bold text-black truncate">
                      Veren: <span className="text-emerald-600">{vote.voter.name}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-lg font-black text-black bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200">
                      {vote.rating}
                    </span>
                    <DeleteVoteButton voteId={vote.id} playerId={player.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verdiği Oylar Listesi */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1 px-1">
            <TrendingDown className="text-blue-500" size={18} />
            <h2 className="font-bold text-base text-black">Verdiği Oylar</h2>
          </div>
          
          {givenVotes.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl text-center text-xs text-gray-400 py-6">Henüz kimseye oy vermemiş.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {givenVotes.map(vote => (
                <div key={vote.id} className="bg-white border border-gray-100 p-3 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 truncate">
                      <Clock size={10} /> {vote.createdAt.toLocaleDateString('tr-TR')}
                    </span>
                    <span className="text-xs font-bold text-black truncate">
                      Kime: <span className="text-blue-600">{vote.target.name}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-lg font-black text-black bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200">
                      {vote.rating}
                    </span>
                    <DeleteVoteButton voteId={vote.id} playerId={player.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function BrightStatCard({ label, value }: { label: string, value: number }) {
  let colorClass = "text-slate-700";
  if (value >= 80) colorClass = "text-emerald-600";
  else if (value >= 70) colorClass = "text-blue-600";
  else if (value < 60) colorClass = "text-red-500";

  return (
    <div className="flex flex-col justify-center items-center p-2 rounded-xl bg-white border border-white shadow-sm">
      <span className="text-[9px] font-bold text-slate-400 tracking-wider mb-0.5">{label}</span>
      <span className={`text-base font-black ${colorClass}`}>{value}</span>
    </div>
  );
}
