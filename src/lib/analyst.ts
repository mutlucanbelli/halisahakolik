export interface AnalystResult {
  voterId: string;
  name: string;
  score: number; // Kaç oyuncuda en yakın oyu verdi (+1 puan sayısı)
  avgDiff: number; // Ortalama sapma (örn: ±1.2)
  accuracyPercent: number;
  voteCount: number; // Oyladığı toplam oyuncu sayısı
}

export function getMatchAnalyst(votes: any[]): AnalystResult | null {
  if (!votes || votes.length === 0) return null;

  // 1. Hedef oyunculara göre oyları grupla
  const targetVotes: Record<string, any[]> = {};
  votes.forEach((v: any) => {
    if (!v.targetId || v.rating == null) return;
    if (!targetVotes[v.targetId]) targetVotes[v.targetId] = [];
    targetVotes[v.targetId].push(v);
  });

  const targetIds = Object.keys(targetVotes);
  if (targetIds.length === 0) return null;

  // Her voter'ın puanını (+1 isabet) ve sapmasını tut
  const voterStats: Record<string, { voterId: string; voterName: string; score: number; totalDiff: number; voteCount: number }> = {};

  // 2. Her bir hedef oyuncu için en yakın tahmini verenlere +1 puan ver
  targetIds.forEach(tId => {
    const list = targetVotes[tId];
    if (list.length === 0) return;

    const sum = list.reduce((acc, v) => acc + Number(v.rating), 0);
    const avg = sum / list.length; // Hedef oyuncunun aldığı ortalama puan

    // En küçük sapmayı bul
    let minDiff = Infinity;
    list.forEach(v => {
      const diff = Math.abs(Number(v.rating) - avg);
      if (diff < minDiff) minDiff = diff;
    });

    // En küçük sapmayı yapan HER voter'a +1 isabet puanı ekle
    list.forEach(v => {
      const diff = Math.abs(Number(v.rating) - avg);
      const vId = v.voterId;
      const vName = v.voter?.name || v.voterName || 'Bilinmeyen Oyuncu';

      if (!voterStats[vId]) {
        voterStats[vId] = { voterId: vId, voterName: vName, score: 0, totalDiff: 0, voteCount: 0 };
      }

      voterStats[vId].totalDiff += diff;
      voterStats[vId].voteCount += 1;

      // Eğer bu hedef oyuncuda en yakın tahmini yaptıysa (veya en yakınlarla eşitse) +1 puan!
      if (diff === minDiff) {
        voterStats[vId].score += 1;
      }
    });
  });

  const statsList = Object.values(voterStats).filter(s => s.voteCount > 0);
  if (statsList.length === 0) return null;

  // 3. En çok +1 puan alan (eşitlik durumunda en az ortalama sapması olan) voter'ı seç
  statsList.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score; // En çok bilene öncelik (+1 puanı en yüksek)
    const avgDiffA = a.totalDiff / a.voteCount;
    const avgDiffB = b.totalDiff / b.voteCount;
    return avgDiffA - avgDiffB; // Eşitlikte en az ortalama sapma
  });

  const winner = statsList[0];
  const avgDiff = Math.round((winner.totalDiff / winner.voteCount) * 10) / 10;
  const accuracyPercent = Math.max(0, Math.round((100 - avgDiff) * 10) / 10);

  return {
    voterId: winner.voterId,
    name: winner.voterName,
    score: winner.score,
    avgDiff,
    accuracyPercent,
    voteCount: winner.voteCount
  };
}
