using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using HalisahaMvc.Models.Entities;
using HalisahaMvc.Services.Db;

namespace HalisahaMvc.Services.Repositories
{
    public static class PlayerRepository
    {
        private const string SelectColumns = @"
            Id, Username, PasswordHash, MustChangePassword, Name, Positions,
            RatingGK, RatingDEF, RatingMID, RatingFWD, Rating, CreatedAt, UpdatedAt";

        public static Player GetById(string id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.QuerySingleOrDefault<Player>(
                    $"SELECT {SelectColumns} FROM Player WHERE Id = @Id", new { Id = id });
            }
        }

        public static Player GetByUsername(string username)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.QuerySingleOrDefault<Player>(
                    $"SELECT {SelectColumns} FROM Player WHERE Username = @Username", new { Username = username });
            }
        }

        public static bool UsernameExists(string username)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.ExecuteScalar<int>(
                    "SELECT COUNT(1) FROM Player WHERE Username = @Username", new { Username = username }) > 0;
            }
        }

        /// <summary>Full player list ordered by rating descending (leaderboard order).</summary>
        public static List<Player> GetAllByRatingDesc()
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.Query<Player>($"SELECT {SelectColumns} FROM Player ORDER BY Rating DESC").AsList();
            }
        }

        public static List<Player> GetAllByCreatedDesc()
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.Query<Player>($"SELECT {SelectColumns} FROM Player ORDER BY CreatedAt DESC").AsList();
            }
        }

        public static int Count()
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.ExecuteScalar<int>("SELECT COUNT(1) FROM Player");
            }
        }

        public static Dictionary<string, Player> GetAllById()
        {
            return GetAllByRatingDesc().ToDictionary(p => p.Id, p => p);
        }

        public static void Insert(Player player)
        {
            player.CreatedAt = DateTime.UtcNow;
            player.UpdatedAt = DateTime.UtcNow;
            using (var conn = DbConnectionFactory.Create())
            {
                conn.Execute(@"
                    INSERT INTO Player (Id, Username, PasswordHash, MustChangePassword, Name, Positions,
                        RatingGK, RatingDEF, RatingMID, RatingFWD, Rating, CreatedAt, UpdatedAt)
                    VALUES (@Id, @Username, @PasswordHash, @MustChangePassword, @Name, @Positions,
                        @RatingGK, @RatingDEF, @RatingMID, @RatingFWD, @Rating, @CreatedAt, @UpdatedAt)",
                    player);
            }
        }

        public static void Update(Player player)
        {
            player.UpdatedAt = DateTime.UtcNow;
            using (var conn = DbConnectionFactory.Create())
            {
                conn.Execute(@"
                    UPDATE Player SET
                        Name = @Name, Positions = @Positions,
                        RatingGK = @RatingGK, RatingDEF = @RatingDEF, RatingMID = @RatingMID, RatingFWD = @RatingFWD,
                        Rating = @Rating, UpdatedAt = @UpdatedAt
                    WHERE Id = @Id",
                    player);
            }
        }

        public static void UpdatePassword(string playerId, string passwordHash, bool mustChangePassword)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                conn.Execute(
                    "UPDATE Player SET PasswordHash = @PasswordHash, MustChangePassword = @MustChangePassword, UpdatedAt = @Now WHERE Id = @Id",
                    new { PasswordHash = passwordHash, MustChangePassword = mustChangePassword, Now = DateTime.UtcNow, Id = playerId });
            }
        }

        public static void UpdateRatings(Player player)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                conn.Execute(@"
                    UPDATE Player SET
                        RatingGK = @RatingGK, RatingDEF = @RatingDEF, RatingMID = @RatingMID, RatingFWD = @RatingFWD,
                        Rating = @Rating, UpdatedAt = @Now
                    WHERE Id = @Id",
                    new { player.RatingGK, player.RatingDEF, player.RatingMID, player.RatingFWD, player.Rating, Now = DateTime.UtcNow, player.Id });
            }
        }

        public static void ResetAllRatingsTo50()
        {
            using (var conn = DbConnectionFactory.Create())
            {
                conn.Execute(@"UPDATE Player SET RatingGK = 50, RatingDEF = 50, RatingMID = 50, RatingFWD = 50, Rating = 50, UpdatedAt = @Now",
                    new { Now = DateTime.UtcNow });
            }
        }

        public static void Delete(string id)
        {
            using (var conn = DbConnectionFactory.Create())
            using (var tx = conn.BeginTransaction())
            {
                conn.Execute("DELETE FROM Vote WHERE VoterId = @Id OR TargetId = @Id", new { Id = id }, tx);
                conn.Execute("DELETE FROM MatchPlayer WHERE PlayerId = @Id", new { Id = id }, tx);
                conn.Execute("DELETE FROM Player WHERE Id = @Id", new { Id = id }, tx);
                tx.Commit();
            }
        }
    }
}
