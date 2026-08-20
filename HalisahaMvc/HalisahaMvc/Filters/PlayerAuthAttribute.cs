using System;
using System.Web;
using System.Web.Mvc;
using HalisahaMvc.Services.Repositories;

namespace HalisahaMvc.Filters
{
    /// <summary>
    /// Guards player-facing actions. Validates that the player_session cookie actually resolves
    /// to an existing Player row (handles the deleted-player edge case for free) and stashes the
    /// loaded player on ViewBag.CurrentPlayer so actions don't have to re-fetch it.
    /// </summary>
    public class PlayerAuthAttribute : ActionFilterAttribute
    {
        public const string CookieName = "player_session";

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var cookie = filterContext.HttpContext.Request.Cookies[CookieName];
            var player = cookie != null ? PlayerRepository.GetById(cookie.Value) : null;

            if (player == null)
            {
                if (cookie != null) ClearCookie(filterContext.HttpContext.Response);
                filterContext.Result = new RedirectResult("~/");
                return;
            }

            filterContext.Controller.ViewBag.CurrentPlayer = player;
            base.OnActionExecuting(filterContext);
        }

        public static void ClearCookie(HttpResponseBase response)
        {
            response.Cookies.Add(new HttpCookie(CookieName, string.Empty) { Expires = DateTime.Now.AddDays(-1) });
        }
    }
}
