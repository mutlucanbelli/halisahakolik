using System;
using Dapper;
using HalisahaMvc.Services.Db;

namespace HalisahaMvc.Services
{
    /// <summary>
    /// Verbatim port of admin/actions.ts's resetDatabase(): wipes all match/vote history and
    /// resets every player's ratings back to 50, but keeps the Player rows themselves. Unlike the
    /// original (four separate un-transacted calls), this is wrapped in a single SQLite
    /// transaction so a mid-way failure can't leave the database in an inconsistent state.
    /// </summary>
    public static class ResetService
    {
        public static void ResetDatabase()
        {
            using (var conn = DbConnectionFactory.Create())
            using (var tx = conn.BeginTransaction())
            {
                conn.Execute("DELETE FROM Vote", transaction: tx);
                conn.Execute("DELETE FROM MatchPlayer", transaction: tx);
                conn.Execute("DELETE FROM Match", transaction: tx);
                conn.Execute("UPDATE Player SET RatingGK=50, RatingDEF=50, RatingMID=50, RatingFWD=50, Rating=50, UpdatedAt=@Now",
                    new { Now = DateTime.UtcNow }, tx);
                tx.Commit();
            }
        }
    }
}
