"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAdmin(formData: FormData) {
  const password = formData.get("password");
  
  // Basit şifre (gerçek projede env'den alınmalı)
  if (password === "admin123") {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", "true", { httpOnly: true, path: "/" });
  }
  
  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  redirect("/admin");
}
