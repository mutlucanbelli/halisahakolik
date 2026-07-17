"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { resetDatabase } from "./actions";

export default function ResetDataButton() {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const confirm1 = window.confirm("DİKKAT: Tüm oylar ve maç kayıtları kalıcı olarak silinecektir.\n\nEmin misiniz?");
    if (!confirm1) return;

    const confirm2 = window.confirm("Oyuncular silinmeyecek, ancak sistemdeki herkesin güçleri 0'a sıfırlanacaktır.\n\nBu işlem geri alınamaz. Onaylıyor musunuz?");
    if (!confirm2) return;

    setLoading(true);
    try {
      await resetDatabase();
      window.alert("Veritabanı başarıyla temizlendi. Tüm oyuncu puanları 0'landı.");
    } catch (err) {
      window.alert("Bir hata oluştu: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleReset} 
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl font-bold shadow-sm transition-all hover:bg-rose-100 active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Trash2 size={16} />
      {loading ? "Sıfırlanıyor..." : "Sistemi Sıfırla"}
    </button>
  );
}
