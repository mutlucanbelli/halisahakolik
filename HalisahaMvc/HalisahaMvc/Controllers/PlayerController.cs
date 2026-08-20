using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web.Mvc;
using HalisahaMvc.Filters;
using HalisahaMvc.Models.Entities;
using HalisahaMvc.Models.ViewModels;
using HalisahaMvc.Services;
using HalisahaMvc.Services.Repositories;

namespace HalisahaMvc.Controllers
{
    [PlayerAuth]
    public class PlayerController : Controller
    {
        private static readonly CultureInfo TrCulture = new CultureInfo("tr-TR");

        // GET /player
        public ActionResult Index()
        {
            var player = (Player)ViewBag.CurrentPlayer;
            var vm = BuildDashboard(player);
            return View(vm);
        }

        private PlayerDashboardViewModel BuildDashboard(Player player)
        {
            var vm = new PlayerDashboardViewModel { CurrentPlayer = player };

            var allPlayers = PlayerRepository.GetAllByRatingDesc();
            var playersById = allPlayers.ToDictionary(p => p.Id, p => p);

            BuildNextMatchSection(vm, player, playersById);
            BuildLastMatchSection(vm, player, playersById);
            BuildVotingSection(vm, player, playersById);
            BuildLeaderboardSection(vm, player, allPlayers);

            vm.AwardBadges = BadgeService.GetAwardBadges();
            vm.FormChartData = MatchPlayerRepository.GetLastNCompletedForPlayer(player.Id, 5)
                .Select(mp => new FormPointViewModel
                {
                    Date = mp.MatchDate.ToString("d MMM", TrCulture),
                    EarnedRating = mp.EarnedRating ?? 50,
                    Position = mp.Position
                })
                .ToList();

            return vm;
        }

        private void BuildNextMatchSection(PlayerDashboardViewModel vm, Player player, Dictionary<string, Player> playersById)
        {
            var nextMatch = MatchRepository.GetNextPendingOrVoting();
            vm.NextMatch = nextMatch;
            if (nextMatch == null) return;

            var roster = MatchPlayerRepository.GetRosterForMatch(nextMatch.Id);

            List<RosterPlayerViewModel> BuildTeam(string team) => roster
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
                        IsMe = p.Id == player.Id
                    };
                })
                .OrderBy(r => PositionHelper.SortOrder(PositionHelper.GetCategory(r.MatchPosition)))
                .ThenByDescending(r => r.Rating)
                .ToList();

            vm.TeamA = BuildTeam("A");
            vm.TeamB = BuildTeam("B");

            var mine = roster.FirstOrDefault(mp => mp.PlayerId == player.Id);
            vm.MyTeam = mine?.Team ?? "";
        }

        private void BuildLastMatchSection(PlayerDashboardViewModel vm, Player player, Dictionary<string, Player> playersById)
        {
            var lastMatch = MatchRepository.GetLastCompletedForPlayer(player.Id);
            vm.LastMatch = lastMatch;
            if (lastMatch == null) return;

            vm.LastMatchOwnEntry = MatchPlayerRepository.GetForMatchAndPlayer(lastMatch.Id, player.Id);

            var votes = VoteRepository.GetForMatch(lastMatch.Id);

            var mvp = AnalystService.GetMatchMvp(votes);
            vm.LastMatchMvpName = mvp?.Name ?? "Belirlenmedi";
            vm.LastMatchMvpRating = mvp?.RoundedAvg ?? 0;

            vm.LastMatchAnalyst = AnalystService.GetMatchAnalyst(votes);
            vm.LastMatchWorstAnalyst = AnalystService.GetMatchWorstAnalyst(votes);

            var myVotes = votes.Where(v => v.TargetId == player.Id).OrderByDescending(v => v.Rating).ToList();
            if (myVotes.Count > 0)
            {
                var highest = myVotes.First();
                var lowest = myVotes.Last();
                vm.HighestVoter = new VoterRefViewModel { Name = highest.VoterName, Rating = highest.Rating };
                vm.LowestVoter = new VoterRefViewModel { Name = lowest.VoterName, Rating = lowest.Rating };
            }
        }

        private void BuildVotingSection(PlayerDashboardViewModel vm, Player player, Dictionary<string, Player> playersById)
        {
            var votingMatch = MatchRepository.GetActiveVotingMatchForPlayer(player.Id);
            vm.VotingMatch = votingMatch;
            if (votingMatch == null || string.IsNullOrEmpty(votingMatch.ActiveVotePlayerId)) return;
            if (votingMatch.ActiveVotePlayerId == player.Id) return; // cannot vote on yourself

            if (playersById.TryGetValue(votingMatch.ActiveVotePlayerId, out var target))
            {
                vm.ActiveVoteTarget = target;
                vm.HasVotedForActive = VoteRepository.Exists(votingMatch.Id, player.Id, target.Id);
            }
        }

        private void BuildLeaderboardSection(PlayerDashboardViewModel vm, Player player, List<Player> allPlayers)
        {
            vm.Leaderboard = allPlayers.Select(p => new LeaderboardEntryViewModel
            {
                Id = p.Id,
                Name = p.Name,
                MainPosition = PositionHelper.MainPosition(p.Positions),
                Rating = p.Rating,
                IsMe = p.Id == player.Id
            }).ToList();

            vm.MyRank = allPlayers.FindIndex(p => p.Id == player.Id) + 1;
        }

        // POST /player/vote — live vote submission (AJAX). Preserves the original's quirk of
        // always reporting success to the UI even when the vote already existed.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public JsonResult SubmitVote(string matchId, string targetId, int rating)
        {
            var player = (Player)ViewBag.CurrentPlayer;
            if (!VoteRepository.Exists(matchId, player.Id, targetId))
            {
                rating = Math.Max(1, Math.Min(100, rating));
                VoteRepository.Insert(new Vote
                {
                    Id = Guid.NewGuid().ToString("N"),
                    MatchId = matchId,
                    VoterId = player.Id,
                    TargetId = targetId,
                    Rating = rating
                });
            }
            return Json(new { success = true });
        }

        // POST /player/change-password
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ChangePassword(string password)
        {
            var player = (Player)ViewBag.CurrentPlayer;
            if (string.IsNullOrWhiteSpace(password) || password.Length < 4)
            {
                TempData["ChangePasswordError"] = "Eksik bilgi.";
                return RedirectToAction("Index");
            }

            PlayerRepository.UpdatePassword(player.Id, CredentialService.HashPassword(password), false);
            return RedirectToAction("Index");
        }
    }
}
