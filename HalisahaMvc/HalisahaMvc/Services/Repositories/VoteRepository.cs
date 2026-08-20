using System.Collections.Generic;
using Dapper;
using HalisahaMvc.Models.Entities;
using HalisahaMvc.Services.Db;

namespace HalisahaMvc.Services.Repositories
{
    public static class VoteRepository
    {
        /// <summary>All votes for a match, with voter/target names joined in for display + analyst scoring.</summary>
        public static List<Vote> GetForMatch(string matchId)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.Query<Vote>(
                    @"SELECT v.Id, v.MatchId, v.VoterId, v.TargetId, v.Rating,
                             voter.Name AS VoterName, target.Name AS TargetName
                      FROM Vote v
                      INNER JOIN Player voter ON voter.Id = v.VoterId
                      INNER JOIN Player target ON target.Id = v.TargetId
                      WHERE v.MatchId = @MatchId",
                    new { MatchId = matchId }).AsList();
            }
        }

        public static List<Vote> GetForPlayerInMatch(string matchId, string voterId)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.Query<Vote>(
                    "SELECT Id, MatchId, VoterId, TargetId, Rating FROM Vote WHERE MatchId = @MatchId AND VoterId = @VoterId",
                    new { MatchId = matchId, VoterId = voterId }).AsList();
            }
        }

        public static bool Exists(string matchId, string voterId, string targetId)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.ExecuteScalar<int>(
                    "SELECT COUNT(1) FROM Vote WHERE MatchId = @MatchId AND VoterId = @VoterId AND TargetId = @TargetId",
                    new { MatchId = matchId, VoterId = voterId, TargetId = targetId }) > 0;
            }
        }

        public static void Insert(Vote vote)
        {
            using (var conn = DbConnectionFactory.Create())
            {
                conn.Execute("INSERT INTO Vote (Id, MatchId, VoterId, TargetId, Rating) VALUES (@Id, @MatchId, @VoterId, @TargetId, @Rating)", vote);
            }
        }

        /// <summary>All votes ever cast, with the voter's name joined in — feeds the Generous/Stingy badges.</summary>
        public static List<Vote> GetAllWithVoterName()
        {
            using (var conn = DbConnectionFactory.Create())
            {
                return conn.Query<Vote>(
                    @"SELECT v.Id, v.MatchId, v.VoterId, v.TargetId, v.Rating, voter.Name AS VoterName
                      FROM Vote v INNER JOIN Player voter ON voter.Id = v.VoterId").AsList();
            }
        }
    }
}
