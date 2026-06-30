"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Generate random player code
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function addPlayer(formData: FormData) {
  const name = formData.get("name") as string;
  const positions = formData.get("positions") as string;
  
  const code = generateCode();

  await prisma.player.create({
    data: {
      name,
      positions,
      code,
      shooting: 0,
      passing: 0,
      dribbling: 0,
      defending: 0,
      physical: 0,
      pace: 0,
      rating: 0
    }
  });

  revalidatePath("/admin/players");
}

export async function deletePlayer(id: string) {
  await prisma.$transaction([
    prisma.councilVote.deleteMany({
      where: { OR: [{ voterId: id }, { targetId: id }] }
    }),
    prisma.vote.deleteMany({
      where: { OR: [{ voterId: id }, { targetId: id }] }
    }),
    prisma.matchPlayer.deleteMany({
      where: { playerId: id }
    }),
    prisma.player.delete({
      where: { id }
    })
  ]);
  revalidatePath("/admin/players");
}

export async function updatePlayer(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const positions = formData.get("positions") as string;
  
  await prisma.player.update({
    where: { id },
    data: {
      name,
      positions
    }
  });

  revalidatePath("/admin/players");
}

export async function resetPlayerStats(id: string) {
  await prisma.player.update({
    where: { id },
    data: {
      shooting: 0,
      passing: 0,
      dribbling: 0,
      defending: 0,
      physical: 0,
      pace: 0,
      rating: 0
    }
  });
  revalidatePath("/admin/players");
}

export async function reevaluatePlayer(playerId: string) {
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) return;

  // 1. Sadece Maç Oyları Ortalaması (Kullanıcının isteği: bekleyen maç puanlarını dağıt)
  const matchVotes = await prisma.vote.findMany({ where: { targetId: playerId } });
  
  if (matchVotes.length === 0) return; // Dağıtılacak maç puanı yok

  const sum = matchVotes.reduce((acc: number, vote: any) => acc + vote.rating, 0);
  const matchOverall = sum / matchVotes.length;

  // 2. Yeni Ortalama (Mevcut rating 0 ise direkt maç performansını al, değilse ortalamasını al)
  const newRating = player.rating === 0 ? matchOverall : (player.rating + matchOverall) / 2;

  // 3. Detaylı istatistikleri yeni ortalamaya göre orantılı olarak kaydır
  // Örneğin eski overall 60, yeni overall 70 ise fark +10'dur.
  const difference = newRating - player.rating;
  
  const clamp = (val: number) => Math.max(1, Math.min(100, Math.round(val)));

  await prisma.$transaction([
    prisma.player.update({
      where: { id: playerId },
      data: {
        rating: newRating,
        shooting: clamp(player.shooting + difference),
        passing: clamp(player.passing + difference),
        dribbling: clamp(player.dribbling + difference),
        defending: clamp(player.defending + difference),
        physical: clamp(player.physical + difference),
        pace: clamp(player.pace + difference)
      }
    }),
    // Geçmişi (Bekleyen oyları) temizle ki tekrar hesaba katılmasın
    prisma.vote.deleteMany({
      where: { targetId: playerId }
    })
  ]);

  revalidatePath("/admin/players");
}
