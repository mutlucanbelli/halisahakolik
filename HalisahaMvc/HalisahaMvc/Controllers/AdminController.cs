using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using HalisahaMvc.Filters;
using HalisahaMvc.Models.Entities;
using HalisahaMvc.Models.ViewModels;
using HalisahaMvc.Services;
using HalisahaMvc.Services.Repositories;

namespace HalisahaMvc.Controllers
{
    [AdminAuth]
    public class AdminController : Controller
    {
        // GET /admin
        public ActionResult Index()
        {
            var vm = new AdminDashboardViewModel
            {
                PlayerCount = PlayerRepository.Count(),
                PendingMatchCount = MatchRepository.CountByStatus(MatchStatus.Pending),
                CompletedMatchCount = MatchRepository.CountByStatus(MatchStatus.Completed)
            };

            var allPlayers = PlayerRepository.GetAllByRatingDesc();
            var playersById = allPlayers.ToDictionary(p => p.Id, p => p);

            vm.TopPlayers = allPlayers.Take(5).Select(p => new LeaderboardEntryViewModel
            {
                Id = p.Id,
                Name = p.Name,
                MainPosition = PositionHelper.MainPosition(p.Positions),
                Rating = p.Rating
            }).ToList();

            vm.NextMatch = MatchRepository.GetNextPendingUpcoming();
            if (vm.NextMatch != null)
            {
                var roster = MatchPlayerRepository.GetRosterForMatch(vm.NextMatch.Id);
                vm.NextMatchTeamA = RosterHelper.BuildTeam(roster, playersById, "A");
                vm.NextMatchTeamB = RosterHelper.BuildTeam(roster, playersById, "B");
            }

            vm.RecentMatches = MatchRepository.GetCompletedTakeLast(2).Select(m =>
            {
                var roster = MatchPlayerRepository.GetRosterForMatch(m.Id);
                var teamA = RosterHelper.BuildTeam(roster, playersById, "A");
                var teamB = RosterHelper.BuildTeam(roster, playersById, "B");
                var votes = VoteRepository.GetForMatch(m.Id);

                return new RecentMatchSummaryViewModel
                {
                    Match = m,
                    TeamAAvg = teamA.Count > 0 ? System.Math.Ceiling(teamA.Average(p => p.Rating)) : 0,
                    TeamBAvg = teamB.Count > 0 ? System.Math.Ceiling(teamB.Average(p => p.Rating)) : 0,
                    Analyst = votes.Count > 0 ? AnalystService.GetMatchAnalyst(votes) : null,
                    Worst = votes.Count > 0 ? AnalystService.GetMatchWorstAnalyst(votes) : null
                };
            }).ToList();

            vm.AwardBadges = BadgeService.GetAwardBadges();

            return View(vm);
        }

        // POST /admin/reset — wipes all match/vote history, resets player ratings to 50.
        // Destructive; gated behind a double client-side confirm in the view.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Reset()
        {
            ResetService.ResetDatabase();
            return RedirectToAction("Index");
        }
    }
}
