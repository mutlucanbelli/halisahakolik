using System.Web.Mvc;

namespace HalisahaMvc.Filters
{
    /// <summary>
    /// Guards admin-facing actions. Single shared-password model (no per-admin identity),
    /// matching the original app — but applied consistently to every admin controller/action,
    /// closing the original's gap where only the dashboard page itself checked this cookie.
    /// </summary>
    public class AdminAuthAttribute : ActionFilterAttribute
    {
        public const string CookieName = "admin_session";
        public const string AuthenticatedValue = "authenticated";

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var cookie = filterContext.HttpContext.Request.Cookies[CookieName];
            if (cookie == null || cookie.Value != AuthenticatedValue)
            {
                filterContext.Result = new RedirectResult("~/admin/login");
                return;
            }
            base.OnActionExecuting(filterContext);
        }
    }
}
