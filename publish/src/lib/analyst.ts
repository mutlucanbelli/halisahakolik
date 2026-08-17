export interface AnalystResult {
  voterId: string;
  name: string;
  avgDiff: number;
  accuracyPercent: number;
  voteCount: number;
}

export function getMatchAnalyst(votes: any[]): AnalystResult | null {
  if (!votes || votes.length === 0) return null;

  // 1. Her hedef oyuncunun genel ortalama puanını hesapla
  const targetTotals: Record<string, number> = {};
  const targetCounts: Record<string, number> = {};

  votes.forEach((v: any) => {
    if (!v.targetId || v.rating == null) return;
    if (!targetTotals[v.targetId]) {
      targetTotals[v.targetId] = 0;
      targetCounts[v.targetId] = 0;
    }
    targetTotals[v.targetId] += v.rating;
    targetCounts[v.targetId] += 1;
  });

  const targetAvgs: Record<string, number> = {};
  Object.keys(targetTotals).forEach(tId => {
    targetAvgs[tId] = targetTotals[tId] / targetCounts[tId];
  });

  // 2. Her oy veren için genel ortalamaya olan mutlak sapmayı hesapla
  const voterStats: Record<string, { voterId: string; voterName: string; totalDiff: number; count: number }> = {};

  votes.forEach((v: any) => {
    const tAvg = targetAvgs[v.targetId];
    if (tAvg === undefined) return;

    const diff = Math.abs(v.rating - tAvg);
    const vId = v.voterId;
    const vName = v.voter?.name || 'Bilinmeyen Oyuncu';

    if (!voterStats[vId]) {
      voterStats[vId] = { voterId: vId, voterName: vName, totalDiff: 0, count: 0 };
    }
    voterStats[vId].totalDiff += diff;
    voterStats[vId].count += 1;
  });

  let best: AnalystResult | null = null;
  let minDiff = Infinity;

  Object.values(voterStats).forEach(stat => {
    if (stat.count === 0) return;
    const avgDiff = stat.totalDiff / stat.count;
    if (avgDiff < minDiff) {
      minDiff = avgDiff;
      const roundedDiff = Math.round(avgDiff * 10) / 10;
      const accuracyPercent = Math.max(0, Math.round((100 - avgDiff) * 10) / 10);
      best = {
        voterId: stat.voterId,
        name: stat.voterName,
        avgDiff: roundedDiff,
        accuracyPercent,
        voteCount: stat.count
      };
    }
  });

  return best;
}
