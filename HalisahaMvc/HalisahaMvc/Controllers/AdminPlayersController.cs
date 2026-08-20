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
    public class AdminPlayersController : Controller
    {
        // GET /admin/players
        public ActionResult Index()
        {
            var vm = new PlayerListViewModel { Players = PlayerRepository.GetAllByCreatedDesc() };
            return View(vm);
        }

        // GET /admin/players/{id}
        public ActionResult Detail(string id)
        {
            var player = PlayerRepository.GetById(id);
            if (player == null) return HttpNotFound();

            var history = MatchPlayerRepository.GetHistoryForPlayer(id);
            var vm = new PlayerDetailViewModel
            {
                Player = player,
                MatchHistory = history.Select(h => new MatchHistoryEntryViewModel
                {
                    MatchId = h.MatchId,
                    Date = h.Date,
                    Status = h.Status,
                    Position = h.Position,
                    EarnedRating = h.EarnedRating,
                    IsApplied = h.IsApplied
                }).ToList()
            };

            vm.FormChartData = MatchPlayerRepository.GetLastNCompletedForPlayer(id, 5)
                .Select(mp => new FormPointViewModel
                {
                    Date = mp.MatchDate.ToString("d MMM", new System.Globalization.CultureInfo("tr-TR")),
                    EarnedRating = mp.EarnedRating ?? 50,
                    Position = mp.Position
                })
                .ToList();

            var unapplied = MatchPlayerRepository.GetUnappliedCompletedForPlayer(id);
            var gk = unapplied.Where(mp => mp.Position == "Kaleci").ToList();
            var outfield = unapplied.Where(mp => mp.Position != "Kaleci").ToList();
            vm.UnappliedGkCount = gk.Count;
            vm.UnappliedOutfieldCount = outfield.Count;
            if (unapplied.Count >= 3)
            {
                if (gk.Count > 0) vm.PreviewGkAvg = gk.Average(mp => mp.EarnedRating ?? 0);
                if (outfield.Count > 0) vm.PreviewOutfieldAvg = outfield.Average(mp => mp.EarnedRating ?? 0);
            }

            vm.NewlyResetPassword = TempData["NewlyResetPassword"] as string;

            return View(vm);
        }

        // POST /admin/players/create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(string name, string[] selectedPositions, string mainPosition,
            double? ratingGK, double? ratingDEF, double? ratingMID, double? ratingFWD)
        {
            if (string.IsNullOrWhiteSpace(name) || selectedPositions == null || selectedPositions.Length == 0)
            {
                TempData["PlayerFormError"] = "Ad ve en az bir mevki gerekli.";
                return RedirectToAction("Index");
            }

            var positionsCsv = BuildPositionsCsv(selectedPositions, mainPosition);
            var mainCategory = PositionHelper.GetCategory(PositionHelper.MainPosition(positionsCsv));

            var player = new Player
            {
                Id = Guid.NewGuid().ToString("N"),
                Name = name.Trim(),
                Positions = positionsCsv,
                RatingGK = ratingGK ?? 50,
                RatingDEF = ratingDEF ?? 50,
                RatingMID = ratingMID ?? 50,
                RatingFWD = ratingFWD ?? 50,
                MustChangePassword = true
            };
            player.Rating = RatingForCategory(player, mainCategory);
            player.Username = CredentialService.GenerateUniqueUsername(name);
            player.PasswordHash = CredentialService.HashPassword(CredentialService.GeneratePassword());

            PlayerRepository.Insert(player);
            return RedirectToAction("Index");
        }

        // POST /admin/players/{id}/edit
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(string id, string name, string[] selectedPositions, string mainPosition,
            double? ratingGK, double? ratingDEF, double? ratingMID, double? ratingFWD)
        {
            var player = PlayerRepository.GetById(id);
            if (player == null) return HttpNotFound();

            var positionsCsv = BuildPositionsCsv(selectedPositions, mainPosition);
            var mainCategory = PositionHelper.GetCategory(PositionHelper.MainPosition(positionsCsv));

            player.Name = name.Trim();
            player.Positions = positionsCsv;
            player.RatingGK = ratingGK ?? 50;
            player.RatingDEF = ratingDEF ?? 50;
            player.RatingMID = ratingMID ?? 50;
            player.RatingFWD = ratingFWD ?? 50;
            player.Rating = RatingForCategory(player, mainCategory);

            PlayerRepository.Update(player);
            return RedirectToAction("Detail", new { id });
        }

        // POST /admin/players/{id}/reset-password
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ResetPassword(string id)
        {
            var newPassword = CredentialService.GeneratePassword();
            PlayerRepository.UpdatePassword(id, CredentialService.HashPassword(newPassword), true);
            TempData["NewlyResetPassword"] = newPassword;
            return RedirectToAction("Detail", new { id });
        }

        // POST /admin/players/{id}/delete
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Delete(string id)
        {
            PlayerRepository.Delete(id);
            return RedirectToAction("Index");
        }

        // POST /admin/players/{id}/distribute
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Distribute(string id, string type)
        {
            RatingDistributionService.ReevaluatePlayer(id, type);
            return RedirectToAction("Detail", new { id });
        }

        // POST /admin/players/bulk-distribute
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult BulkDistribute()
        {
            RatingDistributionService.BulkReevaluateAll();
            return RedirectToAction("Index");
        }

        private static string BuildPositionsCsv(string[] selectedPositions, string mainPosition)
        {
            var selected = (selectedPositions ?? new string[0]).Where(p => !string.IsNullOrWhiteSpace(p)).ToList();
            if (selected.Count == 0) selected.Add("Orta Saha");

            var main = !string.IsNullOrWhiteSpace(mainPosition) && selected.Contains(mainPosition)
                ? mainPosition
                : selected[0];

            var ordered = new List<string> { main };
            ordered.AddRange(selected.Where(p => p != main));
            return string.Join(", ", ordered);
        }

        private static double RatingForCategory(Player player, PositionHelper.Category category)
        {
            switch (category)
            {
                case PositionHelper.Category.GK: return player.RatingGK;
                case PositionHelper.Category.DEF: return player.RatingDEF;
                case PositionHelper.Category.FWD: return player.RatingFWD;
                default: return player.RatingMID;
            }
        }
    }
}
