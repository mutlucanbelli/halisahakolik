using System.Web.Mvc;
using System.Web.Routing;

namespace HalisahaMvc
{
    public static class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            // Player-facing routes
            routes.MapRoute("PlayerDashboard", "player", new { controller = "Player", action = "Index" });

            // Admin routes with clean urls matching the original Next.js paths
            routes.MapRoute("AdminLogin", "admin/login", new { controller = "AdminAuth", action = "Login" });

            // Literal-segment player routes MUST be registered before AdminPlayerDetail's {id}
            // catch-all, since e.g. "admin/players/create" would otherwise match {id}="create".
            routes.MapRoute("AdminPlayerCreate", "admin/players/create", new { controller = "AdminPlayers", action = "Create" });
            routes.MapRoute("AdminPlayerBulkDistribute", "admin/players/bulk-distribute", new { controller = "AdminPlayers", action = "BulkDistribute" });
            routes.MapRoute("AdminPlayerEdit", "admin/players/{id}/edit", new { controller = "AdminPlayers", action = "Edit" });
            routes.MapRoute("AdminPlayerResetPassword", "admin/players/{id}/reset-password", new { controller = "AdminPlayers", action = "ResetPassword" });
            routes.MapRoute("AdminPlayerDelete", "admin/players/{id}/delete", new { controller = "AdminPlayers", action = "Delete" });
            routes.MapRoute("AdminPlayerDistribute", "admin/players/{id}/distribute", new { controller = "AdminPlayers", action = "Distribute" });
            routes.MapRoute("AdminPlayerDetail", "admin/players/{id}", new { controller = "AdminPlayers", action = "Detail" });
            routes.MapRoute("AdminPlayers", "admin/players", new { controller = "AdminPlayers", action = "Index" });
            routes.MapRoute("AdminMatchDraft", "admin/matches/draft", new { controller = "AdminMatches", action = "Draft" });
            routes.MapRoute("AdminMatchCreate", "admin/matches/create", new { controller = "AdminMatches", action = "Create" });
            routes.MapRoute("AdminMatchCancel", "admin/matches/{id}/cancel", new { controller = "AdminMatches", action = "Cancel" });
            routes.MapRoute("AdminMatchStartVoting", "admin/matches/{id}/start-voting", new { controller = "AdminMatches", action = "StartVoting" });
            routes.MapRoute("AdminMatchSetActiveVote", "admin/matches/{id}/set-active-vote-player", new { controller = "AdminMatches", action = "SetActiveVotePlayer" });
            routes.MapRoute("AdminMatchComplete", "admin/matches/{id}/complete", new { controller = "AdminMatches", action = "Complete" });
            routes.MapRoute("AdminMatches", "admin/matches", new { controller = "AdminMatches", action = "Index" });
            routes.MapRoute("AdminReportDelete", "admin/reports/{matchId}/delete", new { controller = "AdminReports", action = "Delete" });
            routes.MapRoute("AdminReportDetail", "admin/reports/{matchId}", new { controller = "AdminReports", action = "Detail" });
            routes.MapRoute("AdminReports", "admin/reports", new { controller = "AdminReports", action = "Index" });
            routes.MapRoute("AdminReset", "admin/reset", new { controller = "Admin", action = "Reset" });
            routes.MapRoute("Admin", "admin", new { controller = "Admin", action = "Index" });

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
