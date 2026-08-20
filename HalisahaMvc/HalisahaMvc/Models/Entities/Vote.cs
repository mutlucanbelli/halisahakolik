namespace HalisahaMvc.Models.Entities
{
    public class Vote
    {
        public string Id { get; set; }
        public string MatchId { get; set; }
        public string VoterId { get; set; }
        public string TargetId { get; set; }

        /// <summary>1-100.</summary>
        public int Rating { get; set; }

        // Populated by repository joins where needed (not persisted columns).
        public string VoterName { get; set; }
        public string TargetName { get; set; }
    }
}
