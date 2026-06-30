import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, User, TrendingUp, TrendingDown, Clock } from "lucide-react";
import DeleteVoteButton from "./DeleteVoteButton";

export default async function PlayerDetailsPage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;

  const player = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!player) {
    return <div className="container py-12 text-center">Oyuncu bulunamadı.</div>;
  }

  // Başkalarından aldığı oylar (Genel Konsey)
  const receivedVotes = await prisma.councilVote.findMany({
    where: { targetId: playerId },
    include: {
      voter: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Başkalarına verdiği oylar (Genel Konsey)
  const givenVotes = await prisma.councilVote.findMany({
    where: { voterId: playerId },
    include: {
      target: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container py-8 animate-fade-in pb-24">
      {/* Üst Kısım: Geri Butonu ve Profil */}
      <div className="mb-6 flex flex-col gap-4">
        <Link href="/admin/players" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors w-fit">
          <ArrowLeft size={16} /> Oyunculara Dön
        </Link>
        
        <div className="glass-panel p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center font-black text-3xl text-white shadow-xl z-10">
            {player.name.charAt(0)}
          </div>
          <div className="flex flex-col items-center sm:items-start z-10">
            <h1 className="text-2xl font-black text-black">{player.name}</h1>
            <p className="text-gray-500 font-bold tracking-wider uppercase text-xs mt-1">{player.positions}</p>
          </div>
          <div className="flex flex-col items-center sm:items-end sm:ml-auto z-10 bg-white/50 px-6 py-3 rounded-2xl border border-white/60 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mevcut Ort.</span>
            <span className="text-4xl font-black text-black">{player.rating.toFixed(1)}</span>
          </div>

          <div className="absolute -right-10 -bottom-10 text-[150px] font-black text-gray-900 opacity-[0.02] pointer-events-none rotate-12">
            {player.rating.toFixed(0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Aldığı Oylar Listesi */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-2 px-2">
            <TrendingUp className="text-emerald-500" size={20} />
            <h2 className="font-bold text-lg text-black">Diğerlerinden Aldığı Oylar</h2>
          </div>
          
          {receivedVotes.length === 0 ? (
            <div className="glass-panel text-center text-sm text-gray-400 py-8">Henüz oy almamış.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {receivedVotes.map(vote => (
                <div key={vote.id} className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {vote.createdAt.toLocaleDateString('tr-TR')}
                    </span>
                    <span className="text-sm font-bold text-black">
                      Oy Veren: <span className="text-emerald-600">{vote.voter.name}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black text-black bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
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
          <div className="flex items-center gap-2 mb-2 px-2">
            <TrendingDown className="text-blue-500" size={20} />
            <h2 className="font-bold text-lg text-black">Başkalarına Verdiği Oylar</h2>
          </div>
          
          {givenVotes.length === 0 ? (
            <div className="glass-panel text-center text-sm text-gray-400 py-8">Henüz kimseye oy vermemiş.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {givenVotes.map(vote => (
                <div key={vote.id} className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {vote.createdAt.toLocaleDateString('tr-TR')}
                    </span>
                    <span className="text-sm font-bold text-black">
                      Kime: <span className="text-blue-600">{vote.target.name}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black text-black bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
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
