import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginAdmin, logoutAdmin } from "./actions";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";

  if (!isAdmin) {
    return (
      <div className="glass-panel text-center">
        <h2 className="title-sub">Yönetici Girişi</h2>
        <form action={loginAdmin} className="flex flex-col gap-3">
          <input 
            type="password" 
            name="password" 
            placeholder="Şifre" 
            className="input-field" 
            required
          />
          <button type="submit" className="btn-primary">Giriş Yap</button>
        </form>
      </div>
    );
  }

  return (
    <div className="glass-panel">
      <h2 className="title-sub">Hoş Geldiniz</h2>
      <p className="mb-4 text-sm" style={{ color: "#94a3b8" }}>
        Halısaha organizasyonunu buradan yönetebilirsiniz. 
        Oyuncuları ekleyebilir, yeni maçlar oluşturabilir ve oylama başlatabilirsiniz.
      </p>
      
      <div className="flex flex-col gap-3">
        <a href="/admin/players" className="btn-primary" style={{ background: "rgba(59, 130, 246, 0.2)", color: "#60a5fa" }}>
          Oyuncu Yönetimi
        </a>
        <a href="/admin/matches" className="btn-primary" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34d399" }}>
          Maç Yönetimi
        </a>
        
        <form action={logoutAdmin} className="mt-4">
          <button type="submit" className="btn-primary" style={{ background: "transparent", border: "1px solid var(--danger)", color: "var(--danger)" }}>
            Çıkış Yap
          </button>
        </form>
      </div>
    </div>
  );
}
