"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitVote(formData: FormData) {
  const matchId = formData.get("matchId") as string;
  const voterCode = formData.get("voterCode") as string;

  if (!matchId || !voterCode) return { error: "Eksik bilgi." };

  // Bul
  const voter = await prisma.player.findUnique({
    where: { code: voterCode }
  });

  if (!voter) {
    return { error: "Geçersiz oyuncu kodu." };
  }

  // Oylanan matchPlayer'da var mı?
  const isPlayed = await prisma.matchPlayer.findUnique({
    where: {
      matchId_playerId: { matchId, playerId: voter.id }
    }
  });

  if (!isPlayed) {
    return { error: "Bu maçta oynamadığınız için oy kullanamazsınız." };
  }

  // Daha önce oy kullanmış mı?
  const hasVoted = await prisma.vote.findFirst({
    where: { matchId, voterId: voter.id }
  });

  if (hasVoted) {
    return { error: "Bu maç için daha önce oy kullandınız. Bir maça sadece bir kez oy verilebilir." };
  }

  // Oyları al
  const votes: { targetId: string, rating: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("rating_")) {
      const targetId = key.replace("rating_", "");
      const rating = parseInt(value as string);
      if (rating >= 1 && rating <= 100 && targetId !== voter.id) {
        votes.push({ targetId, rating });
      }
    }
  }

  // Kaydet
  await prisma.$transaction(async (tx: any) => {
    for (const v of votes) {
      await tx.vote.upsert({
        where: { matchId_voterId_targetId: { matchId, voterId: voter.id, targetId: v.targetId } },
        update: { rating: v.rating },
        create: { matchId, voterId: voter.id, targetId: v.targetId, rating: v.rating }
      });
    }

    // Puanları güncelleme işlemi artık admin panelindeki "Puanları Dağıt" butonu ile manuel yapılıyor.
    // O yüzden burada direkt player rating'i ezmiyoruz, sadece oyları (vote tablosuna) kaydediyoruz.
  });

  revalidatePath(`/vote/${matchId}`);
  return { success: true };
}
