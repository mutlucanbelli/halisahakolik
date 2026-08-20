using System;
using System.Collections.Generic;
using HalisahaMvc.Models.Entities;

namespace HalisahaMvc.Models.ViewModels
{
    public class RecentMatchSummaryViewModel
    {
        public Match Match { get; set; }
        public double TeamAAvg { get; set; }
        public double TeamBAvg { get; set; }
        public AnalystResult Analyst { get; set; }
        public AnalystResult Worst { get; set; }
    }

    public class AdminDashboardViewModel
    {
        public int PlayerCount { get; set; }
        public int PendingMatchCount { get; set; }
        public int CompletedMatchCount { get; set; }

        public List<LeaderboardEntryViewModel> TopPlayers { get; set; } = new List<LeaderboardEntryViewModel>();

        public Match NextMatch { get; set; }
        public List<RosterPlayerViewModel> NextMatchTeamA { get; set; } = new List<RosterPlayerViewModel>();
        public List<RosterPlayerViewModel> NextMatchTeamB { get; set; } = new List<RosterPlayerViewModel>();

        public List<RecentMatchSummaryViewModel> RecentMatches { get; set; } = new List<RecentMatchSummaryViewModel>();

        public List<AwardBadge> AwardBadges { get; set; } = new List<AwardBadge>();
    }
}
