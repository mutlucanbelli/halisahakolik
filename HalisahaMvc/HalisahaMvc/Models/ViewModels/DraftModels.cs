using System.Collections.Generic;

namespace HalisahaMvc.Models.ViewModels
{
    public class DraftPlayerInput
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Position { get; set; }
        public double Rating { get; set; }
    }

    public class DraftResult
    {
        public List<DraftPlayerInput> TeamA { get; set; } = new List<DraftPlayerInput>();
        public List<DraftPlayerInput> TeamB { get; set; } = new List<DraftPlayerInput>();
    }
}
