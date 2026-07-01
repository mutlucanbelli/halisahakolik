"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAdmin(formData: FormData) {
  const password = formData.get("password") as string;
  // Vercel üzerinden ADMIN_PASSWORD environment variable'ını okur. Ayarlanmamışsa 123456 kabul eder.
  const adminPassword = process.env.ADMIN_PASSWORD || "123456";

  if (password === adminPassword) {
    const cookieStore = await cookies();
    // Tarayıcıya 'admin_session' çerezini (cookie) ekliyoruz. Güvenlik için HttpOnly ayarlıyoruz.
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 hafta geçerli
      path: "/",
    });
    
    // Giriş başarılıysa maçlar sayfasına yönlendir.
    redirect("/admin");
  } else {
    return { error: "Şifre yanlış. Lütfen tekrar deneyin." };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/login");
}

export async function loginPlayer(formData: FormData) {
  const code = formData.get("code") as string;
  
  if (!code || code.trim() === "") {
    return { error: "Lütfen oyuncu kodunuzu girin." };
  }

  // Next.js Server Action içinde doğrudan prisma import edilemeyebilir veya top level'da olmalı. 
  // action dosyasının en başına import prisma from "@/lib/prisma" eklememiz lazım.
  // Wait, let's import it inline to avoid breaking things if it's not imported at top.
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  
  // Türkçe ı, i ve İ harflerini İngilizce I'ya çevir (Klavye hatalarını önlemek için)
  const normalizedCode = code
    .trim()
    .replace(/i/g, 'I')
    .replace(/ı/g, 'I')
    .replace(/İ/g, 'I')
    .toUpperCase();
  
  const player = await prisma.player.findUnique({
    where: { code: normalizedCode }
  });

  if (player) {
    const cookieStore = await cookies();
    cookieStore.set("player_session", player.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 hafta
      path: "/",
    });
    
    redirect("/player");
  } else {
    return { error: "Geçersiz oyuncu kodu. Lütfen tekrar deneyin." };
  }
}

export async function logoutPlayer() {
  const cookieStore = await cookies();
  cookieStore.delete("player_session");
  redirect("/login");
}
