using System;
using System.Collections.Generic;
using HalisahaMvc.Models.Entities;

namespace HalisahaMvc.Models.ViewModels
{
    public class PlayerListViewModel
    {
        public List<Player> Players { get; set; } = new List<Player>();
    }

    public class MatchHistoryEntryViewModel
    {
        public string MatchId { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
        public string Position { get; set; }
        public double? EarnedRating { get; set; }
        public bool IsApplied { get; set; }
    }

    public class PlayerDetailViewModel
    {
        public Player Player { get; set; }
        public List<MatchHistoryEntryViewModel> MatchHistory { get; set; } = new List<MatchHistoryEntryViewModel>();
        public List<FormPointViewModel> FormChartData { get; set; } = new List<FormPointViewModel>();

        public int UnappliedGkCount { get; set; }
        public int UnappliedOutfieldCount { get; set; }
        public double? PreviewGkAvg { get; set; }
        public double? PreviewOutfieldAvg { get; set; }

        public string NewlyResetPassword { get; set; }
    }

    /// <summary>Fixed position set offered by the create/edit forms (matches the original PlayerForm.tsx).</summary>
    public static class SelectablePositions
    {
        public static readonly string[] All = { "Kaleci", "Defans", "Orta Saha", "Kanat", "Forvet" };
    }
}
