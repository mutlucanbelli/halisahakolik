namespace HalisahaMvc.Models.Entities
{
    public class MatchPlayer
    {
        public string Id { get; set; }
        public string MatchId { get; set; }
        public string PlayerId { get; set; }

        /// <summary>"A" or "B".</summary>
        public string Team { get; set; }

        /// <summary>Position played in THIS specific match — may differ from the player's stored Positions.</summary>
        public string Position { get; set; }

        /// <summary>Raw (unrounded) average vote rating for this player in this match, set by CompleteMatch. Null until the match is completed.</summary>
        public double? EarnedRating { get; set; }

        /// <summary>Whether EarnedRating has already been folded into the player's permanent rating via distribution.</summary>
        public bool IsApplied { get; set; }
    }
}
