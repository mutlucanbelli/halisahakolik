"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '.') // boşlukları noktaya çevir
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıIİi]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u')
    .replace(/[^\w\-.]+/g, '') // özel karakterleri sil
    .replace(/\-\-+/g, '-') 
    .replace(/^-+/, '') 
    .replace(/-+$/, '');
}

function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function addPlayer(formData: FormData) {
  const name = formData.get("name") as string;
  const positions = formData.get("positions") as string;
  
  const rating_GK = parseFloat(formData.get("rating_GK") as string) || 50;
  const rating_DEF = parseFloat(formData.get("rating_DEF") as string) || 50;
  const rating_MID = parseFloat(formData.get("rating_MID") as string) || 50;
  const rating_FWD = parseFloat(formData.get("rating_FWD") as string) || 50;

  const positionsArr = positions.split(',').map(p => p.trim());
  const mainPos = positionsArr[0]?.toLowerCase() || "";
  
  let rating = 50;
  if (mainPos.includes("kaleci") || mainPos.includes("gk")) rating = rating_GK;
  else if (mainPos.includes("defans") || mainPos.includes("stoper") || mainPos.includes("bek")) rating = rating_DEF;
  else if (mainPos.includes("forvet") || mainPos.includes("santrfor") || mainPos.includes("kanat")) rating = rating_FWD;
  else rating = rating_MID;

  let baseUsername = slugify(name);
  let username = baseUsername;
  let counter = 1;
  
  // Eşsiz kullanıcı adı bul
  while (await prisma.player.findUnique({ where: { username } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  const password = generatePassword();

  await prisma.player.create({
    data: {
      name,
      positions,
      username,
      password,
      rating_GK,
      rating_DEF,
      rating_MID,
      rating_FWD,
      rating
    }
  });

  revalidatePath("/admin/players");
}

export async function deletePlayer(id: string) {
  await prisma.$transaction([
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
  redirect("/admin/players");
}

export async function updatePlayer(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const positions = formData.get("positions") as string;
  
  const rating_GK = parseFloat(formData.get("rating_GK") as string) || 50;
  const rating_DEF = parseFloat(formData.get("rating_DEF") as string) || 50;
  const rating_MID = parseFloat(formData.get("rating_MID") as string) || 50;
  const rating_FWD = parseFloat(formData.get("rating_FWD") as string) || 50;
  const positionsArr = positions.split(',').map(p => p.trim());
  const mainPos = positionsArr[0]?.toLowerCase() || "";
  
  let rating = 50;
  if (mainPos.includes("kaleci") || mainPos.includes("gk")) rating = rating_GK;
  else if (mainPos.includes("defans") || mainPos.includes("stoper") || mainPos.includes("bek")) rating = rating_DEF;
  else if (mainPos.includes("forvet") || mainPos.includes("santrfor") || mainPos.includes("kanat")) rating = rating_FWD;
  else rating = rating_MID;

  await prisma.player.update({
    where: { id },
    data: {
      name,
      positions,
      rating_GK,
      rating_DEF,
      rating_MID,
      rating_FWD,
      rating
    }
  });

  revalidatePath("/admin/players");
}

export async function resetPassword(id: string) {
  const password = generatePassword();
  await prisma.player.update({
    where: { id },
    data: {
      password,
      mustChangePassword: true
    }
  });
  revalidatePath("/admin/players");
  return password;
}

export async function resetPlayerStats(id: string) {
  await prisma.player.update({
    where: { id },
    data: {
      rating_GK: 50,
      rating_DEF: 50,
      rating_MID: 50,
      rating_FWD: 50,
      rating: 50
    }
  });
  revalidatePath("/admin/players");
}

export async function reevaluatePlayer(playerId: string) {
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) return;

  // Sadece işlenmemiş maçları bul (isApplied == false)
  const unappliedMatches = await prisma.matchPlayer.findMany({
    where: { 
      playerId, 
      isApplied: false,
      earnedRating: { not: null },
      match: { status: "COMPLETED" }
    }
  });

  if (unappliedMatches.length === 0) return; // Dağıtılacak puan yok

  let new_GK = player.rating_GK;
  let new_DEF = player.rating_DEF;
  let new_MID = player.rating_MID;
  let new_FWD = player.rating_FWD;

  for (const mp of unappliedMatches) {
    const avgForMatch = mp.earnedRating!;
    const pos = mp.position;

    // O mevki için eski puanın %50'si ile yeni maçın %50'sini al
    if (pos === "Kaleci") {
      new_GK = new_GK === 50 ? avgForMatch : (new_GK + avgForMatch) / 2;
    } else if (pos === "Defans") {
      new_DEF = new_DEF === 50 ? avgForMatch : (new_DEF + avgForMatch) / 2;
    } else if (pos === "Orta Saha") {
      new_MID = new_MID === 50 ? avgForMatch : (new_MID + avgForMatch) / 2;
    } else if (pos === "Forvet" || pos === "Kanat") {
      new_FWD = new_FWD === 50 ? avgForMatch : (new_FWD + avgForMatch) / 2;
    } else {
      new_GK = (new_GK + avgForMatch) / 2;
      new_DEF = (new_DEF + avgForMatch) / 2;
      new_MID = (new_MID + avgForMatch) / 2;
      new_FWD = (new_FWD + avgForMatch) / 2;
    }
  }

  // Yeni Ana OVR'yi bul
  const positionsArr = player.positions.split(',').map(p => p.trim());
  const mainPos = positionsArr[0]?.toLowerCase() || "";
  
  let newRating = 50;
  if (mainPos.includes("kaleci") || mainPos.includes("gk")) newRating = new_GK;
  else if (mainPos.includes("defans") || mainPos.includes("stoper") || mainPos.includes("bek")) newRating = new_DEF;
  else if (mainPos.includes("forvet") || mainPos.includes("santrfor") || mainPos.includes("kanat")) newRating = new_FWD;
  else newRating = new_MID;

  await prisma.$transaction([
    prisma.player.update({
      where: { id: playerId },
      data: {
        rating_GK: new_GK,
        rating_DEF: new_DEF,
        rating_MID: new_MID,
        rating_FWD: new_FWD,
        rating: newRating
      }
    }),
    // Oyları silmek yerine sadece MatchPlayer kayıtlarını "İşlendi" olarak işaretliyoruz
    prisma.matchPlayer.updateMany({
      where: { 
        playerId, 
        isApplied: false,
        earnedRating: { not: null },
        match: { status: "COMPLETED" } 
      },
      data: { isApplied: true }
    })
  ]);

  revalidatePath("/admin/players");
}
