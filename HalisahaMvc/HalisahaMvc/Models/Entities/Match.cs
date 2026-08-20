using System;

namespace HalisahaMvc.Models.Entities
{
    public static class MatchStatus
    {
        public const string Pending = "PENDING";
        public const string Voting = "VOTING";
        public const string Completed = "COMPLETED";
    }

    public class Match
    {
        public string Id { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; } = MatchStatus.Pending;

        /// <summary>Id of the player currently "on stage" for live voting, or null.</summary>
        public string ActiveVotePlayerId { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
