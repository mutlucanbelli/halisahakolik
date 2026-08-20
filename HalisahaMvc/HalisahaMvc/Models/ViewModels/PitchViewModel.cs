using System.Collections.Generic;

namespace HalisahaMvc.Models.ViewModels
{
    public class PitchViewModel
    {
        public List<RosterPlayerViewModel> TeamA { get; set; } = new List<RosterPlayerViewModel>();
        public List<RosterPlayerViewModel> TeamB { get; set; } = new List<RosterPlayerViewModel>();
    }
}
