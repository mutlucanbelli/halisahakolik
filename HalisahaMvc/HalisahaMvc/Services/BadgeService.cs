using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using HalisahaMvc.Models.ViewModels;
using HalisahaMvc.Services.Repositories;

namespace HalisahaMvc.Services
{
    /// <summary>
    /// Verbatim port of src/lib/badges.ts's getAwardBadges(). Computed fresh on every call
    /// (no caching table), same as the original. Wrapped in try/catch so a failure in one
    /// badge computation doesn't take down the whole dashboard — matches original behavior.
    /// </summary>
    public static class BadgeService
    {
        public static List<AwardBadge> GetAwardBadges()
        {
            var badges = new List<AwardBadge>();
            try
            {
                var playersById = PlayerRepository.GetAllById();

                // --- Analyst / Worst Analyst / Hero, from the single most-recent completed match ---
                var lastMatch = MatchRepository.GetLastCompletedOverall();
                if (lastMatch != null)
                {
                    var votes = VoteRepository.GetForMatch(lastMatch.Id);
                    if (votes.Count > 0)
                    {
                        var best = AnalystService.GetMatchAnalyst(votes);
                        var worst = AnalystService.GetMatchWorstAnalyst(votes);

                        if (best != null)
                        {
                            badges.Add(new AwardBadge
                            {
                                Id = "analyst",
                                Title = "Haftanın Analizcisi",
                                PlayerName = best.Name,
                                Detail = $"{best.Score}/{best.VoteCount} İsabet (±{best.AvgDiff} Sapma)",
                                BadgeType = "analyst",
                                Color = "from-blue-600 to-indigo-700"
                            });
                        }
                        if (worst != null && worst.Name != best?.Name)
                        {
                            badges.Add(new AwardBadge
                            {
                                Id = "worst",
                                Title = "Haftanın Karavanası",
                                PlayerName = worst.Name,
                                Detail = $"{worst.Score}/{worst.VoteCount} Karavana (±{worst.AvgDiff} Sapma)",
                                BadgeType = "worst",
                                Color = "from-rose-600 to-red-700"
                            });
                        }
                    }

                    var roster = MatchPlayerRepository.GetRosterForMatch(lastMatch.Id);
                    var hero = AnalystService.GetMatchSurpriseHero(
                        roster.Cast<Models.Entities.MatchPlayer>().ToList(), playersById);
                    if (hero != null)
                    {
                        badges.Add(new AwardBadge
                        {
                            Id = "hero",
                            Title = "Maçın Sürpriz Kahramanı",
                            PlayerName = hero.Name,
                            Detail = $"Beklendiğinin +{hero.Diff} OVR Üzerinde Sıçrama ✨",
                            BadgeType = "hero",
                            Color = "from-cyan-600 to-blue-700"
                        });
                    }
                }

                // --- "Alev Alev (En Formda)" — best single-match performance across ALL history ---
                var allRated = MatchPlayerRepository.GetAllCompletedWithEarnedRating();
                if (allRated.Count > 0)
                {
                    double topEarned = allRated.Max(mp => mp.EarnedRating ?? double.MinValue);
                    var tiedTopForms = allRated.Where(mp => Math.Abs((mp.EarnedRating ?? 0) - topEarned) < 0.01).ToList();
                    var formNames = tiedTopForms
                        .Select(mp => playersById.TryGetValue(mp.PlayerId, out var p) ? p.Name : "Bilinmeyen Oyuncu")
                        .Distinct();

                    badges.Add(new AwardBadge
                    {
                        Id = "form",
                        Title = "Alev Alev (En Formda)",
                        PlayerName = string.Join(" & ", formNames),
                        Detail = $"Son Maç Reytingi: {Math.Ceiling(topEarned)} OVR 🔥",
                        BadgeType = "form",
                        Color = "from-amber-500 to-orange-600"
                    });
                }

                // --- Generous / Stingy voters, min 3 votes cast to qualify ---
                var allVotes = VoteRepository.GetAllWithVoterName();
                var voterStats = allVotes
                    .GroupBy(v => v.VoterId)
                    .Select(g => new
                    {
                        VoterId = g.Key,
                        Name = g.First().VoterName,
                        Avg = g.Average(v => v.Rating),
                        Count = g.Count()
                    })
                    .Where(s => s.Count >= 3)
                    .OrderByDescending(s => s.Avg)
                    .ToList();

                if (voterStats.Count > 0)
                {
                    var generous = voterStats[0];
                    var tiedGenerous = voterStats.Where(s => Math.Abs(s.Avg - generous.Avg) < 0.05).ToList();
                    var generousNames = string.Join(" & ", tiedGenerous.Select(s => s.Name).Distinct());
                    double generousAvgRounded = Math.Round(generous.Avg * 10) / 10;

                    badges.Add(new AwardBadge
                    {
                        Id = "generous",
                        Title = "En Cömert Oyuncu",
                        PlayerName = generousNames,
                        Detail = $"Verdiği Ort. Puan: {generousAvgRounded} 💚",
                        BadgeType = "generous",
                        Color = "from-emerald-600 to-teal-700"
                    });

                    var stingy = voterStats[voterStats.Count - 1];
                    var tiedStingy = voterStats.Where(s => Math.Abs(s.Avg - stingy.Avg) < 0.05).ToList();
                    var stingyNames = string.Join(" & ", tiedStingy.Select(s => s.Name).Distinct());

                    if (stingyNames != generousNames)
                    {
                        double stingyAvgRounded = Math.Round(stingy.Avg * 10) / 10;
                        badges.Add(new AwardBadge
                        {
                            Id = "stingy",
                            Title = "En Cimri Oyuncu",
                            PlayerName = stingyNames,
                            Detail = $"Verdiği Ort. Puan: {stingyAvgRounded} 💜",
                            BadgeType = "stingy",
                            Color = "from-purple-600 to-violet-800"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Trace.TraceError("BadgeService.GetAwardBadges failed: " + ex);
            }

            return badges;
        }
    }
}
