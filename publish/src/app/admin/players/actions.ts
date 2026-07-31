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

export async function reevaluatePlayer(playerId: string, type: 'gk' | 'outfield') {
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) return;

  // Dağıtılmamış, tamamlanmış tüm maçları getir
  const unappliedMatches = await prisma.matchPlayer.findMany({
    where: { 
      playerId, 
      isApplied: false,
      earnedRating: { not: null },
      match: { status: "COMPLETED" }
    }
  });

  // En az 2 tamamlanmış maç şartı
  if (unappliedMatches.length < 2) return;

  // Maçları GK ve outfield olarak ayır
  const gkMatches = unappliedMatches.filter(mp => mp.position === "Kaleci");
  const outfieldMatches = unappliedMatches.filter(mp => mp.position !== "Kaleci");

  const avg = (arr: { earnedRating: number | null }[]) =>
    arr.reduce((sum, mp) => sum + (mp.earnedRating || 0), 0) / arr.length;

  const positionsArr = player.positions.split(',').map((p: string) => p.trim());
  const mainPos = positionsArr[0]?.toLowerCase() || "";

  let updateData: Record<string, number> = {};
  let idsToMark: string[] = [];

  if (type === 'gk' && gkMatches.length > 0) {
    const newGK = avg(gkMatches);
    updateData.rating_GK = newGK;
    if (mainPos.includes("kaleci") || mainPos.includes("gk")) {
      updateData.rating = newGK;
    }
    idsToMark = gkMatches.map(mp => mp.id);

  } else if (type === 'outfield' && outfieldMatches.length > 0) {
    const newOutfield = avg(outfieldMatches);
    if (mainPos.includes("defans") || mainPos.includes("stoper") || mainPos.includes("bek")) {
      updateData.rating_DEF = newOutfield;
      updateData.rating = newOutfield;
    } else if (mainPos.includes("forvet") || mainPos.includes("santrfor") || mainPos.includes("kanat")) {
      updateData.rating_FWD = newOutfield;
      updateData.rating = newOutfield;
    } else if (mainPos.includes("kaleci") || mainPos.includes("gk")) {
      updateData.rating_DEF = newOutfield;
      updateData.rating_MID = newOutfield;
      updateData.rating_FWD = newOutfield;
    } else {
      updateData.rating_MID = newOutfield;
      updateData.rating = newOutfield;
    }
    idsToMark = outfieldMatches.map(mp => mp.id);
  } else {
    return;
  }

  await prisma.$transaction([
    prisma.player.update({
      where: { id: playerId },
      data: updateData
    }),
    prisma.matchPlayer.updateMany({
      where: { id: { in: idsToMark } },
      data: { isApplied: true }
    })
  ]);

  revalidatePath("/admin/players");
}

export async function bulkReevaluateAll() {
  const players = await prisma.player.findMany({
    include: {
      matches: {
        where: {
          isApplied: false,
          earnedRating: { not: null },
          match: { status: "COMPLETED" }
        }
      }
    }
  });

  for (const player of players) {
    // En az 2 tamamlanmış maç şartı
    if (player.matches.length < 2) continue;

    const gkMatches = player.matches.filter(mp => mp.position === "Kaleci");
    const outfieldMatches = player.matches.filter(mp => mp.position !== "Kaleci");

    const avg = (arr: { earnedRating: number | null }[]) =>
      arr.reduce((sum, mp) => sum + (mp.earnedRating || 0), 0) / arr.length;

    const positionsArr = player.positions.split(',').map((p: string) => p.trim());
    const mainPos = positionsArr[0]?.toLowerCase() || "";

    let updateData: Record<string, number> = {};
    let idsToMark: string[] = [];

    if (gkMatches.length > 0) {
      const newGK = avg(gkMatches);
      updateData.rating_GK = newGK;
      if (mainPos.includes("kaleci") || mainPos.includes("gk")) {
        updateData.rating = newGK;
      }
      idsToMark.push(...gkMatches.map(mp => mp.id));
    }

    if (outfieldMatches.length > 0) {
      const newOutfield = avg(outfieldMatches);
      if (mainPos.includes("defans") || mainPos.includes("stoper") || mainPos.includes("bek")) {
        updateData.rating_DEF = newOutfield;
        updateData.rating = newOutfield;
      } else if (mainPos.includes("forvet") || mainPos.includes("santrfor") || mainPos.includes("kanat")) {
        updateData.rating_FWD = newOutfield;
        updateData.rating = newOutfield;
      } else if (mainPos.includes("kaleci") || mainPos.includes("gk")) {
        updateData.rating_DEF = newOutfield;
        updateData.rating_MID = newOutfield;
        updateData.rating_FWD = newOutfield;
      } else {
        updateData.rating_MID = newOutfield;
        updateData.rating = newOutfield;
      }
      idsToMark.push(...outfieldMatches.map(mp => mp.id));
    }

    if (Object.keys(updateData).length > 0 && idsToMark.length > 0) {
      await prisma.$transaction([
        prisma.player.update({
          where: { id: player.id },
          data: updateData
        }),
        prisma.matchPlayer.updateMany({
          where: { id: { in: idsToMark } },
          data: { isApplied: true }
        })
      ]);
    }
  }

  revalidatePath("/admin/players");
}

