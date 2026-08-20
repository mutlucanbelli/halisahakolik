using System;
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
    public class AdminReportsController : Controller
    {
        // GET /admin/reports
        public ActionResult Index()
        {
            var summaries = new List<ReportMatchSummaryViewModel>();

            foreach (var match in MatchRepository.GetCompletedOrderByDateDesc())
            {
                var votes = VoteRepository.GetForMatch(match.Id);
                var mvp = AnalystService.GetMatchMvp(votes);

                summaries.Add(new ReportMatchSummaryViewModel
                {
                    Match = match,
                    MvpName = mvp?.Name,
                    MvpRating = mvp?.RoundedAvg ?? 0,
                    UniqueVoterCount = votes.Select(v => v.VoterId).Distinct().Count(),
                    Analyst = votes.Count > 0 ? AnalystService.GetMatchAnalyst(votes) : null,
                    Worst = votes.Count > 0 ? AnalystService.GetMatchWorstAnalyst(votes) : null
                });
            }

            return View(summaries);
        }

        // GET /admin/reports/{matchId}
        public ActionResult Detail(string matchId)
        {
            var match = MatchRepository.GetById(matchId);
            if (match == null) return HttpNotFound();

            var roster = MatchPlayerRepository.GetRosterForMatch(matchId);
            var votes = VoteRepository.GetForMatch(matchId);
            var playersById = PlayerRepository.GetAllById();
            var rosterPlayerIds = new HashSet<string>(roster.Select(r => r.PlayerId));
            var teamByPlayerId = roster.ToDictionary(r => r.PlayerId, r => r.Team);

            var vm = new ReportDetailViewModel
            {
                Match = match,
                Analyst = votes.Count > 0 ? AnalystService.GetMatchAnalyst(votes) : null,
                Worst = votes.Count > 0 ? AnalystService.GetMatchWorstAnalyst(votes) : null,
                Hero = AnalystService.GetMatchSurpriseHero(roster, playersById)
            };

            foreach (var mp in roster.OrderByDescending(r => r.EarnedRating ?? -1))
            {
                if (!playersById.TryGetValue(mp.PlayerId, out var player)) continue;

                var received = votes.Where(v => v.TargetId == mp.PlayerId).ToList();
                var given = votes.Where(v => v.VoterId == mp.PlayerId).ToList();

                var row = new PlayerReportRowViewModel { Player = player, EarnedRating = mp.EarnedRating };

                if (received.Count > 0)
                {
                    double rawAvg = received.Average(v => v.Rating);
                    int maxRating = received.Max(v => v.Rating);
                    int minRating = received.Min(v => v.Rating);
                    var closest = received.OrderBy(v => Math.Abs(v.Rating - rawAvg)).First();

                    row.VotesReceived = received.Select(v => new VoteDisplayRow
                    {
                        OtherPlayerId = v.VoterId,
                        OtherPlayerName = v.VoterName,
                        Rating = v.Rating,
                        IsMax = v.Rating == maxRating,
                        IsMin = v.Rating == minRating && minRating != maxRating,
                        IsClosestToAvg = v.Id == closest.Id
                    }).ToList();
                }

                row.VotesGiven = given.Select(v => new VoteDisplayRow
                {
                    OtherPlayerId = v.TargetId,
                    OtherPlayerName = v.TargetName,
                    Rating = v.Rating,
                    OtherPlayerTeam = teamByPlayerId.TryGetValue(v.TargetId, out var team) ? team : null
                }).ToList();

                vm.Players.Add(row);
            }

            return View(vm);
        }

        // POST /admin/reports/{matchId}/delete
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Delete(string matchId)
        {
            MatchRepository.Delete(matchId);
            return RedirectToAction("Index");
        }
    }
}
