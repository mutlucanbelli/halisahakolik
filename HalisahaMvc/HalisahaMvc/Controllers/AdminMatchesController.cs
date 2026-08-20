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
    public class AdminMatchesController : Controller
    {
        // GET /admin/matches
        public ActionResult Index()
        {
            var allPlayers = PlayerRepository.GetAllByRatingDesc();
            var playersById = allPlayers.ToDictionary(p => p.Id, p => p);

            var vm = new AdminMatchesViewModel { AllPlayers = allPlayers };

            foreach (var match in MatchRepository.GetPendingOrVotingOrderByDateDesc())
            {
                var roster = MatchPlayerRepository.GetRosterForMatch(match.Id);
                var card = new MatchCardViewModel
                {
                    Match = match,
                    TeamA = RosterHelper.BuildTeam(roster, playersById, "A"),
                    TeamB = RosterHelper.BuildTeam(roster, playersById, "B"),
                    CanStartVoting = TurkeyTimeHelper.Now() >= match.Date.AddSeconds(60),
                    VotingUnlockTime = match.Date.AddSeconds(60)
                };
                card.TeamAAvg = card.TeamA.Count > 0 ? Math.Ceiling(card.TeamA.Average(p => p.Rating)) : 0;
                card.TeamBAvg = card.TeamB.Count > 0 ? Math.Ceiling(card.TeamB.Average(p => p.Rating)) : 0;

                if (match.Status == MatchStatus.Voting)
                {
                    var votes = VoteRepository.GetForMatch(match.Id);
                    card.LiveVoteCounts = votes.GroupBy(v => v.TargetId).ToDictionary(
                        g => g.Key,
                        g => new VoteCountViewModel { PlayerId = g.Key, Count = g.Count(), Avg = g.Average(v => v.Rating) });
                }

                vm.Matches.Add(card);
            }

            if (TempData["CompletedMvpName"] != null)
            {
                vm.CompletedMvpName = (string)TempData["CompletedMvpName"];
                vm.CompletedMvpRating = (double)TempData["CompletedMvpRating"];
            }

            return View(vm);
        }

        // POST /admin/matches/draft (AJAX) — body: playerIds[], positions[] (parallel arrays)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public JsonResult Draft(string[] playerIds, string[] positions)
        {
            if (playerIds == null || playerIds.Length < 2)
            {
                return Json(new { error = "En az 2 oyuncu seçmelisiniz." });
            }

            var playersById = PlayerRepository.GetAllById();
            var inputs = new List<DraftPlayerInput>();
            for (int i = 0; i < playerIds.Length; i++)
            {
                if (!playersById.TryGetValue(playerIds[i], out var player)) continue;
                var pos = positions != null && i < positions.Length && !string.IsNullOrEmpty(positions[i])
                    ? positions[i]
                    : PositionHelper.MainPosition(player.Positions);
                inputs.Add(new DraftPlayerInput
                {
                    Id = player.Id,
                    Name = player.Name,
                    Position = pos,
                    Rating = PositionHelper.GetPositionRating(player, pos)
                });
            }

            var draft = TeamBalancerService.GenerateDraft(inputs);
            return Json(new
            {
                teamA = draft.TeamA.Select(p => new { p.Id, p.Name, p.Position, rating = Math.Ceiling(p.Rating) }),
                teamB = draft.TeamB.Select(p => new { p.Id, p.Name, p.Position, rating = Math.Ceiling(p.Rating) })
            });
        }

        // POST /admin/matches/create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(string date, string hour, string[] teamAIds, string[] teamAPositions, string[] teamBIds, string[] teamBPositions)
        {
            if (string.IsNullOrEmpty(date) || string.IsNullOrEmpty(hour)) return RedirectToAction("Index");
            var hasAny = (teamAIds != null && teamAIds.Length > 0) || (teamBIds != null && teamBIds.Length > 0);
            if (!hasAny) return RedirectToAction("Index");

            if (!DateTime.TryParse(date + "T" + hour + ":00", out var matchDate))
            {
                return RedirectToAction("Index");
            }

            var match = new Match
            {
                Id = Guid.NewGuid().ToString("N"),
                Date = matchDate,
                Status = MatchStatus.Pending
            };
            MatchRepository.Insert(match);

            AddRoster(match.Id, teamAIds, teamAPositions, "A");
            AddRoster(match.Id, teamBIds, teamBPositions, "B");

            return RedirectToAction("Index");
        }

        private static void AddRoster(string matchId, string[] ids, string[] positions, string team)
        {
            if (ids == null) return;
            for (int i = 0; i < ids.Length; i++)
            {
                if (string.IsNullOrEmpty(ids[i])) continue;
                var position = positions != null && i < positions.Length ? positions[i] : "";
                MatchPlayerRepository.Insert(new Models.Entities.MatchPlayer
                {
                    Id = Guid.NewGuid().ToString("N"),
                    MatchId = matchId,
                    PlayerId = ids[i],
                    Team = team,
                    Position = position,
                    EarnedRating = null,
                    IsApplied = false
                });
            }
        }

        // POST /admin/matches/{id}/cancel
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Cancel(string id)
        {
            MatchRepository.Delete(id);
            return RedirectToAction("Index");
        }

        // POST /admin/matches/{id}/start-voting
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult StartVoting(string id)
        {
            var match = MatchRepository.GetById(id);
            if (match != null && TurkeyTimeHelper.Now() >= match.Date.AddSeconds(60))
            {
                MatchRepository.StartVoting(id);
            }
            return RedirectToAction("Index");
        }

        // POST /admin/matches/{id}/set-active-vote-player
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult SetActiveVotePlayer(string id, string playerId)
        {
            MatchRepository.SetActiveVotePlayer(id, string.IsNullOrEmpty(playerId) ? null : playerId);
            return RedirectToAction("Index");
        }

        // POST /admin/matches/{id}/complete
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Complete(string id)
        {
            MatchRepository.CompleteMatch(id);

            var votes = VoteRepository.GetForMatch(id);
            foreach (var group in votes.GroupBy(v => v.TargetId))
            {
                double avg = group.Average(v => v.Rating);
                var mp = MatchPlayerRepository.GetForMatchAndPlayer(id, group.Key);
                if (mp != null) MatchPlayerRepository.SetEarnedRating(mp.Id, avg);
            }

            var mvp = AnalystService.GetMatchMvp(votes);
            if (mvp != null)
            {
                TempData["CompletedMvpName"] = mvp.Value.Name;
                TempData["CompletedMvpRating"] = mvp.Value.RoundedAvg;
            }

            return RedirectToAction("Index");
        }
    }
}
