"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCouncilVote } from "./actions";

export default function DeleteVoteButton({ voteId, playerId }: { voteId: string, playerId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Bu oyu iptal etmek/sıfırlamak istediğinize emin misiniz? (Oyuncunun ortalaması yeniden hesaplanacaktır)")) {
      return;
    }

    setLoading(true);
    const res = await deleteCouncilVote(voteId, playerId);
    
    if (res?.error) {
      alert(res.error);
      setLoading(false);
    }
    // Başarılıysa sayfa zaten revalidatePath sayesinde yenilenecek.
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      title="Oyu İptal Et"
      className="p-1.5 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
    >
      <Trash2 size={16} />
    </button>
  );
}
