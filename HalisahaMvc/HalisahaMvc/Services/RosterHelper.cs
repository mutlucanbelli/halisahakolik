using System.Collections.Generic;
using System.Linq;
using HalisahaMvc.Models.Entities;
using HalisahaMvc.Models.ViewModels;

namespace HalisahaMvc.Services
{
    /// <summary>Builds a display-ready, position-sorted roster list for one team from raw MatchPlayer rows.</summary>
    public static class RosterHelper
    {
        public static List<RosterPlayerViewModel> BuildTeam(
            List<MatchPlayer> roster, IDictionary<string, Player> playersById, string team, string currentPlayerId = null)
        {
            return roster
                .Where(mp => mp.Team == team && playersById.ContainsKey(mp.PlayerId))
                .Select(mp =>
                {
                    var p = playersById[mp.PlayerId];
                    return new RosterPlayerViewModel
                    {
                        Id = p.Id,
                        Name = p.Name,
                        MatchPosition = mp.Position,
                        Rating = PositionHelper.GetPositionRating(p, mp.Position),
                        IsMe = currentPlayerId != null && p.Id == currentPlayerId
                    };
                })
                .OrderBy(r => PositionHelper.SortOrder(PositionHelper.GetCategory(r.MatchPosition)))
                .ThenByDescending(r => r.Rating)
                .ToList();
        }
    }
}
