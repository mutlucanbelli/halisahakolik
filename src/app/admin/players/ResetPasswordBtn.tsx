"use client";

import { useState, useEffect } from "react";
import { Key, X, CheckCircle, AlertTriangle, Copy } from "lucide-react";
import { resetPassword } from "./actions";
import { createPortal } from "react-dom";

export default function ResetPasswordBtn({ playerId }: { playerId: string }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = async () => {
    setLoading(true);
    const generatedPassword = await resetPassword(playerId);
    setLoading(false);
    setNewPassword(generatedPassword);
    setShowConfirm(false);
  };

  const copyToClipboard = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all">
        
        {/* Confirm Modal */}
        {showConfirm && (
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <AlertTriangle size={24} />
              </div>
              <button onClick={() => setShowConfirm(false)} className="text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-2">Emin misiniz?</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Oyuncunun mevcut şifresi sıfırlanacak ve sisteme bir sonraki girişinde <strong>yeni bir şifre belirlemesi</strong> istenecek. Bu işlemi onaylıyor musunuz?
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={handleReset}
                disabled={loading}
                className="flex-1 bg-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? "Sıfırlanıyor..." : "Evet, Sıfırla"}
              </button>
            </div>
          </div>
        )}

        {/* Result Modal */}
        {newPassword && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-2">Başarıyla Sıfırlandı!</h3>
            <p className="text-sm text-slate-500 mb-6">
              Lütfen aşağıdaki geçici şifreyi oyuncuya iletin. Oyuncu bu şifreyle giriş yaptığında kendi şifresini belirleyebilecektir.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 relative group">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Yeni Şifre</span>
              <span className="text-3xl font-black text-blue-600 tracking-wider">{newPassword}</span>
              
              <button 
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all"
                title="Şifreyi Kopyala"
              >
                {copied ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>

            <button 
              onClick={() => setNewPassword(null)}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-colors shadow-lg"
            >
              Tamam, Kopyaladım
            </button>
          </div>
        )}

      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)} 
        disabled={loading}
        className="flex items-center justify-center gap-2 h-[46px] px-5 rounded-xl border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-500 hover:text-white transition-all shadow-sm font-bold w-full"
      >
        <Key size={16} /> Şifre Sıfırla
      </button>
      
      {mounted && (showConfirm || newPassword) && createPortal(modalContent, document.body)}
    </>
  );
}
