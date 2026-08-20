using System;
using System.Collections.Generic;
using Dapper;
using HalisahaMvc.Models.Entities;
using HalisahaMvc.Services.Db;

namespace HalisahaMvc.Services.Repositories
{
    public static class MatchPlayerRepository
    {
        private const string SelectColumns = "Id, MatchId, PlayerId, Team, Position, EarnedRating, IsApplied";

        public static List<MatchPlayer> GetRosterForMatch(string matchId)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.Query<MatchPlayer>($"SELECT {SelectColumns} FROM MatchPlayer WHERE MatchId = @MatchId",
                    new { MatchId = matchId }).AsList();
            }
        }

        public static MatchPlayer GetForMatchAndPlayer(string matchId, string playerId)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.QuerySingleOrDefault<MatchPlayer>(
                    $"SELECT {SelectColumns} FROM MatchPlayer WHERE MatchId = @MatchId AND PlayerId = @PlayerId",
                    new { MatchId = matchId, PlayerId = playerId });
            }
        }

        /// <summary>Last N completed matches (with EarnedRating set) for a player, oldest first — feeds the form chart.</summary>
        public static List<MatchPlayerWithDate> GetLastNCompletedForPlayer(string playerId, int count)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                var rows = conn.Query<MatchPlayerWithDate>(
                    $@"SELECT mp.{SelectColumns.Replace(", ", ", mp.")}, m.Date AS MatchDate FROM MatchPlayer mp
                       INNER JOIN Match m ON m.Id = mp.MatchId
                       WHERE mp.PlayerId = @PlayerId AND mp.EarnedRating IS NOT NULL AND m.Status = '{MatchStatus.Completed}'
                       ORDER BY m.Date DESC LIMIT @Count",
                    new { PlayerId = playerId, Count = count }).AsList();
                rows.Reverse(); // oldest -> newest
                return rows;
            }
        }

        /// <summary>All-time completed+rated MatchPlayer rows across every player — feeds the "Alev Alev" form badge.</summary>
        public static List<MatchPlayerWithDate> GetAllCompletedWithEarnedRating()
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.Query<MatchPlayerWithDate>(
                    $@"SELECT mp.{SelectColumns.Replace(", ", ", mp.")}, m.Date AS MatchDate FROM MatchPlayer mp
                       INNER JOIN Match m ON m.Id = mp.MatchId
                       WHERE mp.EarnedRating IS NOT NULL AND m.Status = '{MatchStatus.Completed}'
                       ORDER BY m.Date DESC").AsList();
            }
        }

        /// <summary>Unapplied+completed rows for a player, used by rating distribution (min-3 gate applied by the caller).</summary>
        public static List<MatchPlayer> GetUnappliedCompletedForPlayer(string playerId)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.Query<MatchPlayer>(
                    $@"SELECT mp.{SelectColumns.Replace(", ", ", mp.")} FROM MatchPlayer mp
                       INNER JOIN Match m ON m.Id = mp.MatchId
                       WHERE mp.PlayerId = @PlayerId AND mp.IsApplied = 0 AND mp.EarnedRating IS NOT NULL AND m.Status = '{MatchStatus.Completed}'",
                    new { PlayerId = playerId }).AsList();
            }
        }

        /// <summary>Full match history for a player (any status), newest match first — feeds the admin player detail page.</summary>
        public static List<MatchHistoryRow> GetHistoryForPlayer(string playerId)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.Query<MatchHistoryRow>(
                    @"SELECT m.Id AS MatchId, m.Date, m.Status, mp.Position, mp.EarnedRating, mp.IsApplied
                      FROM MatchPlayer mp INNER JOIN Match m ON m.Id = mp.MatchId
                      WHERE mp.PlayerId = @PlayerId
                      ORDER BY m.Date DESC",
                    new { PlayerId = playerId }).AsList();
            }
        }

        public static void Insert(MatchPlayer mp)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                conn.Execute(@"INSERT INTO MatchPlayer (Id, MatchId, PlayerId, Team, Position, EarnedRating, IsApplied)
                               VALUES (@Id, @MatchId, @PlayerId, @Team, @Position, @EarnedRating, @IsApplied)", mp);
            }
        }

        public static void SetEarnedRating(string matchPlayerId, double earnedRating)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                conn.Execute("UPDATE MatchPlayer SET EarnedRating = @EarnedRating WHERE Id = @Id",
                    new { EarnedRating = earnedRating, Id = matchPlayerId });
            }
        }

        public static void MarkApplied(IEnumerable<string> matchPlayerIds)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                conn.Execute("UPDATE MatchPlayer SET IsApplied = 1 WHERE Id = @Id",
                    System.Linq.Enumerable.Select(matchPlayerIds, id => new { Id = id }));
            }
        }
    }

    public class MatchPlayerWithDate : MatchPlayer
    {
        public DateTime MatchDate { get; set; }
    }

    public class MatchHistoryRow
    {
        public string MatchId { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
        public string Position { get; set; }
        public double? EarnedRating { get; set; }
        public bool IsApplied { get; set; }
    }
}
