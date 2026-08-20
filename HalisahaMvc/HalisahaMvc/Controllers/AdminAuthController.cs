using System;
using System.Configuration;
using System.Web;
using System.Web.Mvc;
using HalisahaMvc.Filters;

namespace HalisahaMvc.Controllers
{
    /// <summary>Admin login/logout — port of admin/login/actions.ts's loginAdmin + admin/actions.ts's logoutAdmin.</summary>
    public class AdminAuthController : Controller
    {
        // GET admin/login
        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [ActionName("Login")]
        public ActionResult LoginPost(string password)
        {
            var adminPassword = ConfigurationManager.AppSettings["AdminPassword"] ?? "admin123";

            if (password != adminPassword)
            {
                TempData["LoginError"] = "Şifre yanlış. Lütfen tekrar deneyin.";
                return RedirectToAction("Login");
            }

            var cookie = new HttpCookie(AdminAuthAttribute.CookieName, AdminAuthAttribute.AuthenticatedValue)
            {
                HttpOnly = true,
                Secure = Request.IsSecureConnection,
                Expires = DateTime.Now.AddDays(7),
                Path = "/"
            };
            Response.Cookies.Add(cookie);

            return RedirectToAction("Index", "Admin");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Logout()
        {
            Response.Cookies.Add(new HttpCookie(AdminAuthAttribute.CookieName, string.Empty) { Expires = DateTime.Now.AddDays(-1) });
            return RedirectToAction("Login");
        }
    }
}
