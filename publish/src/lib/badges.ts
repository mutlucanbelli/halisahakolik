import prisma from "@/lib/prisma";
import { getMatchAnalyst, getMatchWorstAnalyst } from "./analyst";

export interface AwardBadge {
  id: string;
  title: string;
  playerName: string;
  detail: string;
  badgeType: 'analyst' | 'worst' | 'form' | 'generous' | 'stingy' | 'ironman';
  color: string;
}

export async function getAwardBadges(): Promise<AwardBadge[]> {
  const badges: AwardBadge[] = [];

  try {
    // 1. Son Tamamlanan Maçı Çek (Analizci ve Karavana için)
    const lastCompletedMatch = await prisma.match.findFirst({
      where: { status: "COMPLETED" },
      orderBy: { date: "desc" },
      include: {
        votes: { include: { voter: true, target: true } }
      }
    });

    if (lastCompletedMatch && lastCompletedMatch.votes.length > 0) {
      const best = getMatchAnalyst(lastCompletedMatch.votes);
      const worst = getMatchWorstAnalyst(lastCompletedMatch.votes);

      if (best) {
        badges.push({
          id: "analyst",
          title: "Haftanın Analizcisi",
          playerName: best.name,
          detail: `${best.score}/${best.voteCount} İsabet (±${best.avgDiff} Sapma)`,
          badgeType: "analyst",
          color: "from-blue-600 to-indigo-700 text-white"
        });
      }

      if (worst && worst.voterId !== best?.voterId) {
        badges.push({
          id: "worst",
          title: "Haftanın Karavanası",
          playerName: worst.name,
          detail: `${worst.score}/${worst.voteCount} Karavana (±${worst.avgDiff} Sapma)`,
          badgeType: "worst",
          color: "from-rose-600 to-red-700 text-white"
        });
      }
    }

    // 2. Tüm Maç Oyuncularını Çek (Alev Alev / Formda için)
    const matchPlayers = await prisma.matchPlayer.findMany({
      where: {
        earnedRating: { not: null },
        match: { status: "COMPLETED" }
      },
      include: {
        player: true,
        match: true
      },
      orderBy: { match: { date: "desc" } }
    });

    if (matchPlayers.length > 0) {
      const sortedByRating = [...matchPlayers].sort((a, b) => (b.earnedRating || 0) - (a.earnedRating || 0));
      const topForm = sortedByRating[0];
      if (topForm && topForm.earnedRating) {
        badges.push({
          id: "form",
          title: "Alev Alev (En Formda)",
          playerName: topForm.player.name,
          detail: `Son Maç Reytingi: ${Math.ceil(topForm.earnedRating)} OVR 🔥`,
          badgeType: "form",
          color: "from-amber-500 to-orange-600 text-white"
        });
      }
    }

    // 3. Oyuncu bazlı tüm Oyları Çek (En Cömert ve En Cimri için)
    const allVotes = await prisma.vote.findMany({
      include: { voter: true }
    });

    if (allVotes.length > 0) {
      const voterStats: Record<string, { name: string; totalGiven: number; count: number }> = {};
      allVotes.forEach(v => {
        if (!v.voterId || v.rating == null) return;
        if (!voterStats[v.voterId]) {
          voterStats[v.voterId] = { name: v.voter?.name || 'Oyuncu', totalGiven: 0, count: 0 };
        }
        voterStats[v.voterId].totalGiven += Number(v.rating);
        voterStats[v.voterId].count += 1;
      });

      const statsArr = Object.values(voterStats).filter(s => s.count >= 3);
      if (statsArr.length > 0) {
        statsArr.sort((a, b) => (b.totalGiven / b.count) - (a.totalGiven / a.count));
        const generous = statsArr[0];
        const stingy = statsArr[statsArr.length - 1];

        if (generous) {
          const avgGiven = Math.round((generous.totalGiven / generous.count) * 10) / 10;
          badges.push({
            id: "generous",
            title: "En Cömert Oyuncu",
            playerName: generous.name,
            detail: `Verdiği Ort. Puan: ${avgGiven} 💚`,
            badgeType: "generous",
            color: "from-emerald-600 to-teal-700 text-white"
          });
        }

        if (stingy && stingy.name !== generous?.name) {
          const avgGiven = Math.round((stingy.totalGiven / stingy.count) * 10) / 10;
          badges.push({
            id: "stingy",
            title: "En Cimri Oyuncu",
            playerName: stingy.name,
            detail: `Verdiği Ort. Puan: ${avgGiven} 💜`,
            badgeType: "stingy",
            color: "from-purple-600 to-violet-800 text-white"
          });
        }
      }
    }

    // 4. Demir Adam (En Çok Maç Yapan)
    const playersWithMatchCounts = await prisma.player.findMany({
      include: {
        _count: {
          select: {
            matches: {
              where: { match: { status: "COMPLETED" } }
            }
          }
        }
      }
    });

    if (playersWithMatchCounts.length > 0) {
      const sortedByMatches = [...playersWithMatchCounts].sort((a, b) => b._count.matches - a._count.matches);
      const ironman = sortedByMatches[0];
      if (ironman && ironman._count.matches > 0) {
        badges.push({
          id: "ironman",
          title: "Demir Adam (İstikrar)",
          playerName: ironman.name,
          detail: `Toplam ${ironman._count.matches} Maç Katılımı 🛡️`,
          badgeType: "ironman",
          color: "from-slate-800 to-slate-950 text-white"
        });
      }
    }

  } catch (error) {
    console.error("Error generating award badges:", error);
  }

  return badges;
}
