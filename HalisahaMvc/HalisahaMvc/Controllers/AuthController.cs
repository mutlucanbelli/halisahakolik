using System;
using System.Web;
using System.Web.Mvc;
using HalisahaMvc.Filters;
using HalisahaMvc.Services;
using HalisahaMvc.Services.Repositories;

namespace HalisahaMvc.Controllers
{
    /// <summary>Player login/logout — port of the root loginPlayer/logoutPlayer server actions.</summary>
    public class AuthController : Controller
    {
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Login(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                TempData["LoginError"] = "Lütfen kullanıcı adı ve şifrenizi girin.";
                return RedirectToAction("Index", "Home");
            }

            var normalizedUsername = username.Trim().ToLowerInvariant();
            var player = PlayerRepository.GetByUsername(normalizedUsername);

            if (player == null || !CredentialService.VerifyPassword(password, player.PasswordHash))
            {
                TempData["LoginError"] = "Geçersiz kullanıcı adı veya şifre.";
                return RedirectToAction("Index", "Home");
            }

            var cookie = new HttpCookie(PlayerAuthAttribute.CookieName, player.Id)
            {
                HttpOnly = true,
                Secure = Request.IsSecureConnection,
                Expires = DateTime.Now.AddYears(1),
                Path = "/"
            };
            Response.Cookies.Add(cookie);

            return RedirectToAction("Index", "Player");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Logout()
        {
            PlayerAuthAttribute.ClearCookie(Response);
            return RedirectToAction("Index", "Home");
        }
    }
}
