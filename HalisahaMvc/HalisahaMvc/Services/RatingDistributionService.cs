using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using HalisahaMvc.Models.Entities;
using HalisahaMvc.Services.Db;
using HalisahaMvc.Services.Repositories;

namespace HalisahaMvc.Services
{
    /// <summary>
    /// Verbatim port of players/actions.ts's reevaluatePlayer/bulkReevaluateAll: folds a player's
    /// unapplied match EarnedRating history into their permanent rating fields. Gated on a minimum
    /// of 3 unapplied+completed MatchPlayer records (GK and outfield matches counted together for
    /// the gate, but averaged separately). Averaging is a simple arithmetic mean of EarnedRating,
    /// grouped by whether MatchPlayer.Position == "Kaleci" (GK matches) vs everything else (outfield).
    /// </summary>
    public static class RatingDistributionService
    {
        private const int MinUnappliedMatches = 3;

        /// <summary>Single-player, single-type distribution (admin player detail page's two separate buttons).</summary>
        public static void ReevaluatePlayer(string playerId, string type)
        {
            var player = PlayerRepository.GetById(playerId);
            if (player == null) return;

            var unapplied = MatchPlayerRepository.GetUnappliedCompletedForPlayer(playerId);
            if (unapplied.Count < MinUnappliedMatches) return;

            var gkMatches = unapplied.Where(mp => mp.Position == "Kaleci").ToList();
            var outfieldMatches = unapplied.Where(mp => mp.Position != "Kaleci").ToList();
            var mainCategory = PositionHelper.GetCategory(PositionHelper.MainPosition(player.Positions));

            var idsToMark = new List<string>();

            if (type == "gk" && gkMatches.Count > 0)
            {
                double newGk = gkMatches.Average(mp => mp.EarnedRating ?? 0);
                player.RatingGK = newGk;
                if (mainCategory == PositionHelper.Category.GK) player.Rating = newGk;
                idsToMark.AddRange(gkMatches.Select(mp => mp.Id));
            }

            if (type == "outfield" && outfieldMatches.Count > 0)
            {
                double newOutfield = outfieldMatches.Average(mp => mp.EarnedRating ?? 0);
                ApplyOutfieldRating(player, mainCategory, newOutfield);
                idsToMark.AddRange(outfieldMatches.Select(mp => mp.Id));
            }

            if (idsToMark.Count == 0) return;

            SaveWithAppliedFlags(player, idsToMark);
        }

        /// <summary>All players in one pass — both GK and outfield branches fire together per player if eligible.</summary>
        public static void BulkReevaluateAll()
        {
            foreach (var player in PlayerRepository.GetAllByRatingDesc())
            {
                var unapplied = MatchPlayerRepository.GetUnappliedCompletedForPlayer(player.Id);
                if (unapplied.Count < MinUnappliedMatches) continue;

                var gkMatches = unapplied.Where(mp => mp.Position == "Kaleci").ToList();
                var outfieldMatches = unapplied.Where(mp => mp.Position != "Kaleci").ToList();
                var mainCategory = PositionHelper.GetCategory(PositionHelper.MainPosition(player.Positions));

                var idsToMark = new List<string>();

                if (gkMatches.Count > 0)
                {
                    double newGk = gkMatches.Average(mp => mp.EarnedRating ?? 0);
                    player.RatingGK = newGk;
                    if (mainCategory == PositionHelper.Category.GK) player.Rating = newGk;
                    idsToMark.AddRange(gkMatches.Select(mp => mp.Id));
                }

                if (outfieldMatches.Count > 0)
                {
                    double newOutfield = outfieldMatches.Average(mp => mp.EarnedRating ?? 0);
                    ApplyOutfieldRating(player, mainCategory, newOutfield);
                    idsToMark.AddRange(outfieldMatches.Select(mp => mp.Id));
                }

                if (idsToMark.Count == 0) continue;

                SaveWithAppliedFlags(player, idsToMark);
            }
        }

        private static void ApplyOutfieldRating(Player player, PositionHelper.Category mainCategory, double newOutfield)
        {
            switch (mainCategory)
            {
                case PositionHelper.Category.DEF:
                    player.RatingDEF = newOutfield;
                    player.Rating = newOutfield;
                    break;
                case PositionHelper.Category.FWD:
                    player.RatingFWD = newOutfield;
                    player.Rating = newOutfield;
                    break;
                case PositionHelper.Category.GK:
                    // A GK who also played outfield matches gets all three outfield sub-ratings
                    // overwritten with the same average, but overall OVR stays GK-derived (unchanged here).
                    player.RatingDEF = newOutfield;
                    player.RatingMID = newOutfield;
                    player.RatingFWD = newOutfield;
                    break;
                default: // MID
                    player.RatingMID = newOutfield;
                    player.Rating = newOutfield;
                    break;
            }
        }

        private static void SaveWithAppliedFlags(Player player, List<string> matchPlayerIds)
        {
            using (var conn = DbConnectionFactory.Create())
            using (var tx = conn.BeginTransaction())
            {
                conn.Execute(@"
                    UPDATE Player SET RatingGK=@RatingGK, RatingDEF=@RatingDEF, RatingMID=@RatingMID,
                        RatingFWD=@RatingFWD, Rating=@Rating, UpdatedAt=@Now WHERE Id=@Id",
                    new { player.RatingGK, player.RatingDEF, player.RatingMID, player.RatingFWD, player.Rating, Now = DateTime.UtcNow, player.Id },
                    tx);

                conn.Execute("UPDATE MatchPlayer SET IsApplied = 1 WHERE Id = @Id",
                    matchPlayerIds.Select(id => new { Id = id }), tx);

                tx.Commit();
            }
        }
    }
}
