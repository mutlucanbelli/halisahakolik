using System;
using System.Collections.Generic;
using System.Linq;
using HalisahaMvc.Models.Entities;
using HalisahaMvc.Models.ViewModels;

namespace HalisahaMvc.Services
{
    /// <summary>
    /// Verbatim port of src/lib/analyst.ts. Exact tie-break epsilons and rounding preserved
    /// for behavioral parity with the original app.
    /// </summary>
    public static class AnalystService
    {
        private class VoterStat
        {
            public string VoterId;
            public string VoterName;
            public int Score;
            public double TotalDiff;
            public int VoteCount;
        }

        /// <summary>
        /// MVP for a match: the target with the strictly-highest average rating (ties keep the
        /// first-encountered target, matching the original's `avg &gt; highestAvg` semantics).
        /// Centralizes a calculation the original TS app duplicated in 3 separate places.
        /// </summary>
        public static (string Name, double RoundedAvg)? GetMatchMvp(List<Vote> votes)
        {
            string mvpName = null;
            double mvpAvg = 0;
            double highestAvg = double.MinValue;

            foreach (var group in votes.GroupBy(v => v.TargetId))
            {
                double avg = group.Average(v => v.Rating);
                if (avg > highestAvg)
                {
                    highestAvg = avg;
                    mvpName = group.First().TargetName;
                    mvpAvg = Math.Ceiling(avg);
                }
            }

            return mvpName != null ? ((string, double)?)(mvpName, mvpAvg) : null;
        }

        /// <summary>"Haftanın Analizcisi" — voter(s) whose votes landed closest to each target's average.</summary>
        public static AnalystResult GetMatchAnalyst(List<Vote> votes)
        {
            var targetGroups = votes.GroupBy(v => v.TargetId).ToList();
            if (targetGroups.Count == 0) return null;

            var voterStats = new Dictionary<string, VoterStat>();

            foreach (var group in targetGroups)
            {
                var list = group.ToList();
                double avg = list.Average(v => v.Rating);
                double minDiff = list.Min(v => Math.Abs(v.Rating - avg));

                foreach (var v in list)
                {
                    double diff = Math.Abs(v.Rating - avg);
                    if (!voterStats.TryGetValue(v.VoterId, out var stat))
                    {
                        stat = new VoterStat
                        {
                            VoterId = v.VoterId,
                            VoterName = !string.IsNullOrEmpty(v.VoterName) ? v.VoterName : "Bilinmeyen Oyuncu"
                        };
                        voterStats[v.VoterId] = stat;
                    }
                    stat.TotalDiff += diff;
                    stat.VoteCount += 1;
                    if (diff == minDiff) stat.Score += 1;
                }
            }

            var statsList = voterStats.Values.Where(s => s.VoteCount > 0).ToList();
            if (statsList.Count == 0) return null;

            statsList = statsList
                .OrderByDescending(s => s.Score)
                .ThenBy(s => s.TotalDiff / s.VoteCount)
                .ToList();

            var winner = statsList[0];
            double winnerAvgDiff = winner.TotalDiff / winner.VoteCount;

            var tiedWinners = statsList
                .Where(s => s.Score == winner.Score && Math.Abs((s.TotalDiff / s.VoteCount) - winnerAvgDiff) < 0.05)
                .ToList();
            string winnerNames = string.Join(" & ", tiedWinners.Select(s => s.VoterName).Distinct());

            double avgDiff = Math.Round(winnerAvgDiff * 10) / 10;
            double accuracyPercent = Math.Max(0, Math.Round((100 - avgDiff) * 10) / 10);

            return new AnalystResult
            {
                VoterId = winner.VoterId,
                Name = winnerNames,
                Score = winner.Score,
                AvgDiff = avgDiff,
                AccuracyPercent = accuracyPercent,
                VoteCount = winner.VoteCount
            };
        }

        /// <summary>"Haftanın Karavanası" — voter(s) whose votes landed farthest from each target's average.</summary>
        public static AnalystResult GetMatchWorstAnalyst(List<Vote> votes)
        {
            var targetGroups = votes.GroupBy(v => v.TargetId).ToList();
            if (targetGroups.Count == 0) return null;

            var voterStats = new Dictionary<string, VoterStat>();

            foreach (var group in targetGroups)
            {
                var list = group.ToList();
                double avg = list.Average(v => v.Rating);
                double maxDiff = list.Max(v => Math.Abs(v.Rating - avg));

                foreach (var v in list)
                {
                    double diff = Math.Abs(v.Rating - avg);
                    if (!voterStats.TryGetValue(v.VoterId, out var stat))
                    {
                        stat = new VoterStat
                        {
                            VoterId = v.VoterId,
                            VoterName = !string.IsNullOrEmpty(v.VoterName) ? v.VoterName : "Bilinmeyen Oyuncu"
                        };
                        voterStats[v.VoterId] = stat;
                    }
                    stat.TotalDiff += diff;
                    stat.VoteCount += 1;
                    // maxDiff must be > 0: a target whose votes were all identical awards no "karavana" point
                    if (diff == maxDiff && maxDiff > 0) stat.Score += 1;
                }
            }

            var statsList = voterStats.Values.Where(s => s.VoteCount > 0).ToList();
            if (statsList.Count == 0) return null;

            statsList = statsList
                .OrderByDescending(s => s.Score)
                .ThenByDescending(s => s.TotalDiff / s.VoteCount)
                .ToList();

            var loser = statsList[0];
            double loserAvgDiff = loser.TotalDiff / loser.VoteCount;

            var tiedLosers = statsList
                .Where(s => s.Score == loser.Score && Math.Abs((s.TotalDiff / s.VoteCount) - loserAvgDiff) < 0.05)
                .ToList();
            string loserNames = string.Join(" & ", tiedLosers.Select(s => s.VoterName).Distinct());

            double avgDiff = Math.Round(loserAvgDiff * 10) / 10;
            double accuracyPercent = Math.Max(0, Math.Round((100 - avgDiff) * 10) / 10);

            return new AnalystResult
            {
                VoterId = loser.VoterId,
                Name = loserNames,
                Score = loser.Score,
                AvgDiff = avgDiff,
                AccuracyPercent = accuracyPercent,
                VoteCount = loser.VoteCount
            };
        }

        /// <summary>"Maçın Sürpriz Kahramanı" — biggest single-match overperformance vs. the player's current OVR.</summary>
        public static HeroResult GetMatchSurpriseHero(List<MatchPlayer> matchPlayers, IDictionary<string, Player> playersById)
        {
            var diffs = matchPlayers
                .Where(mp => mp.EarnedRating.HasValue && playersById.ContainsKey(mp.PlayerId))
                .Select(mp =>
                {
                    var player = playersById[mp.PlayerId];
                    double baseline = player.Rating != 0 ? player.Rating : 50;
                    return new { Name = player.Name, Diff = (mp.EarnedRating ?? 0) - baseline };
                })
                .OrderByDescending(d => d.Diff)
                .ToList();

            if (diffs.Count == 0) return null;
            var top = diffs[0];
            if (top.Diff <= 0) return null;

            var tied = diffs.Where(d => Math.Abs(d.Diff - top.Diff) < 0.1).ToList();
            string names = string.Join(" & ", tied.Select(d => d.Name).Distinct());

            return new HeroResult
            {
                Name = names,
                Diff = Math.Round(top.Diff * 10) / 10
            };
        }
    }
}
