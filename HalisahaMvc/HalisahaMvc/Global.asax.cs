using System.Globalization;
using System.Threading;
using System.Web.Mvc;
using System.Web.Routing;
using HalisahaMvc.Services.Db;

namespace HalisahaMvc
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            // Creates App_Data\halisaha.db and applies the idempotent schema if missing.
            DbInitializer.EnsureDatabase();
        }

        // The original app's numeric formatting (badge details, ratings, diffs, etc.) is plain
        // JS Number.toString(), which always uses a period decimal separator regardless of locale.
        // Force InvariantCulture as the default request culture so default ToString()/string
        // interpolation matches that everywhere; views that explicitly want Turkish month/day
        // names pass a tr-TR CultureInfo to those specific date-formatting calls instead.
        protected void Application_BeginRequest()
        {
            Thread.CurrentThread.CurrentCulture = CultureInfo.InvariantCulture;
            Thread.CurrentThread.CurrentUICulture = CultureInfo.InvariantCulture;
        }
    }
}
