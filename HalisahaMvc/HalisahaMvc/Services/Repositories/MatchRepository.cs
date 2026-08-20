using System;
using System.Collections.Generic;
using Dapper;
using HalisahaMvc.Models.Entities;
using HalisahaMvc.Services.Db;

namespace HalisahaMvc.Services.Repositories
{
    public static class MatchRepository
    {
        private const string SelectColumns = "Id, Date, Status, ActiveVotePlayerId, CreatedAt, UpdatedAt";

        public static Match GetById(string id)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.QuerySingleOrDefault<Match>($"SELECT {SelectColumns} FROM Match WHERE Id = @Id", new { Id = id });
            }
        }

        /// <summary>Earliest PENDING/VOTING match — the "next match" shown on the player dashboard.</summary>
        public static Match GetNextPendingOrVoting()
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.QuerySingleOrDefault<Match>(
                    $@"SELECT {SelectColumns} FROM Match
                       WHERE Status IN ('{MatchStatus.Pending}', '{MatchStatus.Voting}')
                       ORDER BY Date ASC LIMIT 1");
            }
        }

        /// <summary>Match currently in VOTING status that the given player is rostered in.</summary>
        public static Match GetActiveVotingMatchForPlayer(string playerId)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.QuerySingleOrDefault<Match>(
                    $@"SELECT m.{SelectColumns.Replace(", ", ", m.")} FROM Match m
                       INNER JOIN MatchPlayer mp ON mp.MatchId = m.Id
                       WHERE m.Status = '{MatchStatus.Voting}' AND mp.PlayerId = @PlayerId
                       LIMIT 1",
                    new { PlayerId = playerId });
            }
        }

        /// <summary>Most recent COMPLETED match the given player took part in.</summary>
        public static Match GetLastCompletedForPlayer(string playerId)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.QuerySingleOrDefault<Match>(
                    $@"SELECT m.{SelectColumns.Replace(", ", ", m.")} FROM Match m
                       INNER JOIN MatchPlayer mp ON mp.MatchId = m.Id
                       WHERE m.Status = '{MatchStatus.Completed}' AND mp.PlayerId = @PlayerId
                       ORDER BY m.Date DESC LIMIT 1",
                    new { PlayerId = playerId });
            }
        }

        /// <summary>Earliest upcoming PENDING match (date in the future) — used by the admin dashboard summary.</summary>
        public static Match GetNextPendingUpcoming()
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.QuerySingleOrDefault<Match>(
                    $@"SELECT {SelectColumns} FROM Match
                       WHERE Status = '{MatchStatus.Pending}' AND Date >= @Now
                       ORDER BY Date ASC LIMIT 1",
                    new { Now = TurkeyTimeHelper.Now() });
            }
        }

        public static Match GetLastCompletedOverall()
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.QuerySingleOrDefault<Match>(
                    $"SELECT {SelectColumns} FROM Match WHERE Status = '{MatchStatus.Completed}' ORDER BY Date DESC LIMIT 1");
            }
        }

        public static List<Match> GetCompletedOrderByDateDesc()
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.Query<Match>($"SELECT {SelectColumns} FROM Match WHERE Status = '{MatchStatus.Completed}' ORDER BY Date DESC").AsList();
            }
        }

        public static List<Match> GetCompletedTakeLast(int count)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.Query<Match>($"SELECT {SelectColumns} FROM Match WHERE Status = '{MatchStatus.Completed}' ORDER BY Date DESC LIMIT @Count",
                    new { Count = count }).AsList();
            }
        }

        public static List<Match> GetPendingOrVotingOrderByDateDesc()
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.Query<Match>(
                    $@"SELECT {SelectColumns} FROM Match
                       WHERE Status IN ('{MatchStatus.Pending}', '{MatchStatus.Voting}')
                       ORDER BY Date DESC").AsList();
            }
        }

        public static int CountByStatus(string status)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.ExecuteScalar<int>("SELECT COUNT(1) FROM Match WHERE Status = @Status", new { Status = status });
            }
        }

        public static void Insert(Match match)
        {
            match.CreatedAt = DateTime.UtcNow;
            match.UpdatedAt = DateTime.UtcNow;
            using (var conn = DbConnectionFactory.Create())
            {
                conn.Execute(@"INSERT INTO Match (Id, Date, Status, ActiveVotePlayerId, CreatedAt, UpdatedAt)
                               VALUES (@Id, @Date, @Status, @ActiveVotePlayerId, @CreatedAt, @UpdatedAt)", match);
            }
        }

        public static void UpdateStatus(string matchId, string status)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                conn.Execute("UPDATE Match SET Status = @Status, UpdatedAt = @Now WHERE Id = @Id",
                    new { Status = status, Now = DateTime.UtcNow, Id = matchId });
            }
        }

        public static void SetActiveVotePlayer(string matchId, string playerId)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                conn.Execute("UPDATE Match SET ActiveVotePlayerId = @PlayerId, UpdatedAt = @Now WHERE Id = @Id",
                    new { PlayerId = playerId, Now = DateTime.UtcNow, Id = matchId });
            }
        }

        public static void StartVoting(string matchId)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                conn.Execute($"UPDATE Match SET Status = '{MatchStatus.Voting}', ActiveVotePlayerId = NULL, UpdatedAt = @Now WHERE Id = @Id",
                    new { Now = DateTime.UtcNow, Id = matchId });
            }
        }

        public static void CompleteMatch(string matchId)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                conn.Execute($"UPDATE Match SET Status = '{MatchStatus.Completed}', ActiveVotePlayerId = NULL, UpdatedAt = @Now WHERE Id = @Id",
                    new { Now = DateTime.UtcNow, Id = matchId });
            }
        }

        public static void Delete(string matchId)
        {
            using (var conn = DbConnectionFactory.Create())
            using (var tx = conn.BeginTransaction())
            {
                conn.Execute("DELETE FROM MatchPlayer WHERE MatchId = @Id", new { Id = matchId }, tx);
                conn.Execute("DELETE FROM Vote WHERE MatchId = @Id", new { Id = matchId }, tx);
                conn.Execute("DELETE FROM Match WHERE Id = @Id", new { Id = matchId }, tx);
                tx.Commit();
            }
        }
    }
}
