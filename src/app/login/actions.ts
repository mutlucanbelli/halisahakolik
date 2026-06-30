"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAdmin(formData: FormData) {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return { error: "Sistemde ADMIN_PASSWORD ayarlanmamış. Lütfen çevre değişkenlerini kontrol edin." };
  }

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
    redirect("/admin/matches");
  } else {
    return { error: "Şifre yanlış. Lütfen tekrar deneyin." };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/login");
}
