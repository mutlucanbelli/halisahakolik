using HalisahaMvc.Models.Entities;

namespace HalisahaMvc.Services
{
    /// <summary>
    /// Centralizes position-category classification and position-specific rating lookup.
    /// The original Next.js app duplicated this substring logic in ~5 places with a real
    /// inconsistency ("kanat"/winger was FWD in rating lookups but MID in the pitch-view
    /// grouping). This helper unifies "kanat" to FWD everywhere (documented deviation, see plan §7).
    /// </summary>
    public static class PositionHelper
    {
        public enum Category { GK, DEF, MID, FWD }

        public static Category GetCategory(string positionText)
        {
            var p = (positionText ?? string.Empty).ToLowerInvariant();
            if (p.Contains("kaleci") || p.Contains("gk")) return Category.GK;
            if (p.Contains("defans") || p.Contains("stoper") || p.Contains("bek")) return Category.DEF;
            if (p.Contains("forvet") || p.Contains("santrfor") || p.Contains("kanat")) return Category.FWD;
            if (p.Contains("orta saha") || p.Contains("mid")) return Category.MID;
            return Category.MID; // default fallback, matches original's implicit MID default
        }

        public static string Abbreviation(string positionText)
        {
            switch (GetCategory(positionText))
            {
                case Category.GK: return "KL";
                case Category.DEF: return "DEF";
                case Category.FWD: return "FV";
                default: return "OS";
            }
        }

        /// <summary>
        /// Returns the rating that applies for a given position: the player's per-category
        /// rating (RatingGK/DEF/MID/FWD) if a category is resolved, based on positionOverride
        /// (a match-specific position) when supplied, else the player's own Positions field.
        /// </summary>
        public static double GetPositionRating(Player player, string positionOverride = null)
        {
            switch (GetCategory(positionOverride ?? player.Positions))
            {
                case Category.GK: return player.RatingGK;
                case Category.DEF: return player.RatingDEF;
                case Category.FWD: return player.RatingFWD;
                default: return player.RatingMID;
            }
        }

        /// <summary>Sort key for GK→DEF→MID→FWD ordering (used for roster displays).</summary>
        public static int SortOrder(Category category)
        {
            switch (category)
            {
                case Category.GK: return 1;
                case Category.DEF: return 2;
                case Category.MID: return 3;
                default: return 4;
            }
        }

        /// <summary>The player's main position — the first entry in the comma-separated Positions field.</summary>
        public static string MainPosition(string positions)
        {
            if (string.IsNullOrWhiteSpace(positions)) return string.Empty;
            var first = positions.Split(',')[0];
            return first.Trim();
        }
    }
}
