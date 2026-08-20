namespace HalisahaMvc.Models.ViewModels
{
    public class AwardBadge
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string PlayerName { get; set; }
        public string Detail { get; set; }

        /// <summary>analyst | worst | form | generous | stingy | hero — drives icon choice in the view.</summary>
        public string BadgeType { get; set; }

        /// <summary>Tailwind gradient utility classes, e.g. "from-blue-600 to-indigo-700".</summary>
        public string Color { get; set; }
    }
}
