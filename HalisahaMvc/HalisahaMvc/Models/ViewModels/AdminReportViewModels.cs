using System.Collections.Generic;
using HalisahaMvc.Models.Entities;

namespace HalisahaMvc.Models.ViewModels
{
    public class ReportMatchSummaryViewModel
    {
        public Match Match { get; set; }
        public string MvpName { get; set; }
        public double MvpRating { get; set; }
        public int UniqueVoterCount { get; set; }
        public AnalystResult Analyst { get; set; }
        public AnalystResult Worst { get; set; }
    }

    public class VoteDisplayRow
    {
        public string OtherPlayerId { get; set; }
        public string OtherPlayerName { get; set; }
        public int Rating { get; set; }
        public bool IsMax { get; set; }
        public bool IsMin { get; set; }
        public bool IsClosestToAvg { get; set; }
        /// <summary>For "votes given" rows only: the team the target played on in this match.</summary>
        public string OtherPlayerTeam { get; set; }
    }

    public class PlayerReportRowViewModel
    {
        public Player Player { get; set; }
        public double? EarnedRating { get; set; }
        public List<VoteDisplayRow> VotesReceived { get; set; } = new List<VoteDisplayRow>();
        public List<VoteDisplayRow> VotesGiven { get; set; } = new List<VoteDisplayRow>();
    }

    public class ReportDetailViewModel
    {
        public Match Match { get; set; }
        public AnalystResult Analyst { get; set; }
        public AnalystResult Worst { get; set; }
        public HeroResult Hero { get; set; }
        public List<PlayerReportRowViewModel> Players { get; set; } = new List<PlayerReportRowViewModel>();
    }
}
