import { AwardBadge } from "@/lib/badges";
import { Award, AlertTriangle, Flame, HeartHandshake, Coins, ShieldCheck, Sparkles } from "lucide-react";

export default function AwardBadgesSection({ badges }: { badges: AwardBadge[] }) {
  if (!badges || badges.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "analyst": return <Award size={22} className="text-yellow-300" />;
      case "worst": return <AlertTriangle size={22} className="text-rose-200" />;
      case "form": return <Flame size={22} className="text-amber-200" />;
      case "generous": return <HeartHandshake size={22} className="text-emerald-200" />;
      case "stingy": return <Coins size={22} className="text-purple-200" />;
      case "hero": return <Sparkles size={22} className="text-cyan-200" />;
      default: return <Sparkles size={22} className="text-white" />;
    }
  };

  return (
    <section className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-amber-500 fill-amber-400" />
        <h2 className="text-base font-black text-slate-900 tracking-tight">Haftanın Unvanları & Ödüller</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {badges.map(badge => (
          <div
            key={badge.id}
            className={`bg-gradient-to-r ${badge.color} rounded-2xl p-4 shadow-lg border border-white/10 relative overflow-hidden flex items-center justify-between transition-transform hover:scale-[1.01]`}
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-center gap-3 z-10 min-w-0">
              <div className="w-10 h-10 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                {getIcon(badge.badgeType)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-85">{badge.title}</span>
                <span className="text-sm sm:text-base font-black leading-tight mt-0.5 break-words">{badge.playerName}</span>
                <span className="text-[11px] opacity-90 font-medium mt-0.5">{badge.detail}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
