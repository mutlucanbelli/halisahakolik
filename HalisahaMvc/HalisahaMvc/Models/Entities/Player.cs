using System;

namespace HalisahaMvc.Models.Entities
{
    public class Player
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public bool MustChangePassword { get; set; }
        public string Name { get; set; }

        /// <summary>Comma-separated position list, main position listed first (e.g. "Orta Saha, Forvet").</summary>
        public string Positions { get; set; }

        public double RatingGK { get; set; }
        public double RatingDEF { get; set; }
        public double RatingMID { get; set; }
        public double RatingFWD { get; set; }

        /// <summary>Overall rating (OVR), derived from whichever rating_X matches the player's main position.</summary>
        public double Rating { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
