using System;
using System.Collections.Generic;
using HalisahaMvc.Models.Entities;

namespace HalisahaMvc.Models.ViewModels
{
    public class RosterPlayerViewModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string MatchPosition { get; set; }
        public double Rating { get; set; }
        public bool IsMe { get; set; }
    }

    public class VoterRefViewModel
    {
        public string Name { get; set; }
        public int Rating { get; set; }
    }

    public class FormPointViewModel
    {
        public string Date { get; set; }
        public double EarnedRating { get; set; }
        public string Position { get; set; }
    }

    public class LeaderboardEntryViewModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string MainPosition { get; set; }
        public double Rating { get; set; }
        public bool IsMe { get; set; }
    }

    public class PlayerDashboardViewModel
    {
        public Player CurrentPlayer { get; set; }

        // Next match
        public Match NextMatch { get; set; }
        public List<RosterPlayerViewModel> TeamA { get; set; } = new List<RosterPlayerViewModel>();
        public List<RosterPlayerViewModel> TeamB { get; set; } = new List<RosterPlayerViewModel>();
        public string MyTeam { get; set; } = "";

        // Last completed match
        public Match LastMatch { get; set; }
        public MatchPlayer LastMatchOwnEntry { get; set; }
        public string LastMatchMvpName { get; set; }
        public double LastMatchMvpRating { get; set; }
        public AnalystResult LastMatchAnalyst { get; set; }
        public AnalystResult LastMatchWorstAnalyst { get; set; }
        public VoterRefViewModel HighestVoter { get; set; }
        public VoterRefViewModel LowestVoter { get; set; }

        // Live voting
        public Match VotingMatch { get; set; }
        public Player ActiveVoteTarget { get; set; }
        public bool HasVotedForActive { get; set; }

        // Leaderboard
        public List<LeaderboardEntryViewModel> Leaderboard { get; set; } = new List<LeaderboardEntryViewModel>();
        public int MyRank { get; set; }

        // Badges + form
        public List<AwardBadge> AwardBadges { get; set; } = new List<AwardBadge>();
        public List<FormPointViewModel> FormChartData { get; set; } = new List<FormPointViewModel>();
    }
}
