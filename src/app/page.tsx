"use client";

import { useState } from "react";
import { loginPlayer } from "./actions";
import { Lock, UserCheck, UserCircle } from "lucide-react";

export default function PlayerLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await loginPlayer(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-black selection:text-white relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-600/20 rotate-3 transition-transform hover:rotate-0">
            <UserCircle size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Oyuncu Girişi</h1>
          <p className="text-slate-500 font-medium mt-1">Lütfen bilgilerinizi girin</p>
        </div>

        <div className="glass-panel p-8 shadow-2xl border-white/40 animate-fade-in">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm font-semibold animate-in shake">
                <Lock size={16} />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Kullanıcı Adı</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <UserCheck size={18} />
                </div>
                <input 
                  type="text" 
                  name="username"
                  required
                  placeholder="örn: ad.soyad"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-medium shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Şifre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="Şifrenizi girin..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-medium shadow-sm"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-blue-600/20'
              }`}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
