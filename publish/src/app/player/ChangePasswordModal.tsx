"use client";

import { useState } from "react";
import { Lock, CheckCircle2 } from "lucide-react";
import { changePassword } from "./actions";

export default function ChangePasswordModal({ playerId }: { playerId: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (password.length < 4) {
      setError("Şifre en az 4 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("playerId", playerId);
    formData.append("password", password);

    const res = await changePassword(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setSuccess(true);
      window.location.reload();
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Şifre Güncellendi</h2>
          <p className="text-slate-500 font-medium">Yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Güvenlik Uyarısı</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">Sistem tarafından atanan geçici şifrenizi değiştirmeniz gerekmektedir.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm font-semibold text-center">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Yeni Şifre</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-800"
              placeholder="En az 4 karakter"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Yeni Şifre (Tekrar)</label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-800"
              placeholder="Şifrenizi tekrar girin"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full mt-2 bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-blue-600/20'
            }`}
          >
            {loading ? 'Güncelleniyor...' : 'Şifremi Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
}
