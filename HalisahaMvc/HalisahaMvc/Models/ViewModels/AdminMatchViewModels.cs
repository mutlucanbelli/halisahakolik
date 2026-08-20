using System.Collections.Generic;
using HalisahaMvc.Models.Entities;

namespace HalisahaMvc.Models.ViewModels
{
    public class VoteCountViewModel
    {
        public string PlayerId { get; set; }
        public int Count { get; set; }
        public double Avg { get; set; }
    }

    public class MatchCardViewModel
    {
        public Match Match { get; set; }
        public List<RosterPlayerViewModel> TeamA { get; set; } = new List<RosterPlayerViewModel>();
        public List<RosterPlayerViewModel> TeamB { get; set; } = new List<RosterPlayerViewModel>();
        public double TeamAAvg { get; set; }
        public double TeamBAvg { get; set; }
        public bool CanStartVoting { get; set; }
        public System.DateTime VotingUnlockTime { get; set; }
        public Dictionary<string, VoteCountViewModel> LiveVoteCounts { get; set; } = new Dictionary<string, VoteCountViewModel>();
    }

    public class AdminMatchesViewModel
    {
        public List<Player> AllPlayers { get; set; } = new List<Player>();
        public List<MatchCardViewModel> Matches { get; set; } = new List<MatchCardViewModel>();

        public string CompletedMvpName { get; set; }
        public double CompletedMvpRating { get; set; }
    }
}
