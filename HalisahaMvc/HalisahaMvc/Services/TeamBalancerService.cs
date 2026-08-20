using System;
using System.Collections.Generic;
using System.Linq;
using HalisahaMvc.Models.ViewModels;

namespace HalisahaMvc.Services
{
    /// <summary>
    /// Verbatim port of MatchForm.tsx's generateDraft(). N&lt;=22: exhaustive C(N, ceil(N/2)) subset
    /// search minimizing score = ratingDiff + posDiff*3, keeping a pool of near-optimal solutions
    /// (within +3 of the best score found) and randomly picking one — this randomness is
    /// intentional/original, not a bug. N&gt;22: greedy sort-and-alternate fallback to avoid an
    /// excessive combinatorial search. Runs server-side now (was client-side JS in the browser).
    /// </summary>
    public static class TeamBalancerService
    {
        private static readonly Random Rng = new Random();

        public static DraftResult GenerateDraft(List<DraftPlayerInput> players)
        {
            if (players == null || players.Count == 0) return new DraftResult();
            return players.Count > 22 ? GreedyBalance(players) : CombinatorialBalance(players);
        }

        private static DraftResult GreedyBalance(List<DraftPlayerInput> players)
        {
            int n = players.Count;
            int half = (int)Math.Ceiling(n / 2.0);
            var sorted = players.OrderByDescending(p => p.Rating).ToList();

            var teamA = new List<DraftPlayerInput>();
            var teamB = new List<DraftPlayerInput>();
            double sumA = 0, sumB = 0;

            foreach (var p in sorted)
            {
                if (teamA.Count >= half) { teamB.Add(p); sumB += p.Rating; }
                else if (teamB.Count >= half) { teamA.Add(p); sumA += p.Rating; }
                else if (sumA <= sumB) { teamA.Add(p); sumA += p.Rating; }
                else { teamB.Add(p); sumB += p.Rating; }
            }

            return new DraftResult
            {
                TeamA = teamA.OrderByDescending(p => p.Rating).ToList(),
                TeamB = teamB.OrderByDescending(p => p.Rating).ToList()
            };
        }

        private static DraftResult CombinatorialBalance(List<DraftPlayerInput> players)
        {
            int n = players.Count;
            int half = (int)Math.Ceiling(n / 2.0);

            var categories = players.Select(p => (int)PositionHelper.GetCategory(p.Position)).ToArray();
            var ratings = players.Select(p => p.Rating).ToArray();
            var catTotals = new int[4];
            foreach (var c in categories) catTotals[c]++;
            double totalSum = ratings.Sum();

            double bestScore = double.MaxValue;
            var elitePool = new List<(int[] Combo, double Score)>();

            void Evaluate(List<int> combo)
            {
                double sumA = 0;
                var catA = new int[4];
                foreach (var idx in combo)
                {
                    sumA += ratings[idx];
                    catA[categories[idx]]++;
                }
                double sumB = totalSum - sumA;
                double ratingDiff = Math.Abs(sumA - sumB);

                int posDiff = 0;
                for (int c = 0; c < 4; c++)
                {
                    int b = catTotals[c] - catA[c];
                    posDiff += Math.Abs(catA[c] - b);
                }

                double score = ratingDiff + posDiff * 3;

                if (score < bestScore)
                {
                    bestScore = score;
                    elitePool = elitePool.Where(e => e.Score <= bestScore + 3).ToList();
                    elitePool.Add((combo.ToArray(), score));
                }
                else if (score <= bestScore + 3)
                {
                    elitePool.Add((combo.ToArray(), score));
                }
            }

            var current = new List<int>(half);
            void Recurse(int start)
            {
                if (current.Count == half) { Evaluate(current); return; }
                if (current.Count + (n - start) < half) return;
                if (start >= n) return;

                current.Add(start);
                Recurse(start + 1);
                current.RemoveAt(current.Count - 1);

                Recurse(start + 1);
            }
            Recurse(0);

            if (elitePool.Count == 0)
            {
                // Defensive fallback (shouldn't happen for n>=1): no combination was evaluated.
                return GreedyBalance(players);
            }

            var chosen = elitePool[Rng.Next(elitePool.Count)].Combo;
            var teamASet = new HashSet<int>(chosen);

            var teamA = new List<DraftPlayerInput>();
            var teamB = new List<DraftPlayerInput>();
            for (int i = 0; i < n; i++)
            {
                if (teamASet.Contains(i)) teamA.Add(players[i]);
                else teamB.Add(players[i]);
            }

            return new DraftResult
            {
                TeamA = teamA.OrderByDescending(p => p.Rating).ToList(),
                TeamB = teamB.OrderByDescending(p => p.Rating).ToList()
            };
        }
    }
}
