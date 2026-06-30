"use client";

import { useState } from "react";
import { loginAdmin } from "./actions";
import { Lock, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await loginAdmin(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-black selection:text-white relative overflow-hidden">
      
      {/* Dekoratif Arka Plan Şekilleri */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo / İkon */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-black/10 rotate-3 transition-transform hover:rotate-0">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Yönetici Girişi</h1>
          <p className="text-slate-500 font-medium mt-1">Sisteme erişmek için şifrenizi girin</p>
        </div>

        {/* Login Formu */}
        <div className="glass-panel p-8 shadow-2xl border-white/40 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm font-semibold animate-in shake">
                <Lock size={16} />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Yönetici Şifresi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="Şifrenizi girin..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-black/5 focus:border-black transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800 hover:shadow-black/20'
              }`}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
            
          </form>
        </div>

        <div className="mt-8 text-center text-sm font-medium text-slate-400">
          Halısahakolik Admin Sistemi &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
