namespace HalisahaMvc.Models.ViewModels
{
    /// <summary>Result of AnalystService.GetMatchAnalyst / GetMatchWorstAnalyst.</summary>
    public class AnalystResult
    {
        public string VoterId { get; set; }
        /// <summary>Joined with " & " when multiple voters are tied for the title.</summary>
        public string Name { get; set; }
        public int Score { get; set; }
        public double AvgDiff { get; set; }
        public double AccuracyPercent { get; set; }
        public int VoteCount { get; set; }
    }

    /// <summary>Result of AnalystService.GetMatchSurpriseHero.</summary>
    public class HeroResult
    {
        /// <summary>Joined with " & " when multiple players are tied.</summary>
        public string Name { get; set; }
        public double Diff { get; set; }
    }
}
