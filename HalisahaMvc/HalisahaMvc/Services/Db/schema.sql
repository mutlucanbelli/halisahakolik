-- Idempotent schema for Halısaha (mirrors prisma/schema.prisma 1:1).
-- Run once at Application_Start; safe to re-run on every app start / after every deploy.

CREATE TABLE IF NOT EXISTS Player (
    Id                  TEXT PRIMARY KEY,
    Username            TEXT NOT NULL,
    PasswordHash        TEXT NOT NULL,
    MustChangePassword  INTEGER NOT NULL DEFAULT 1,
    Name                TEXT NOT NULL,
    Positions           TEXT NOT NULL,
    RatingGK            REAL NOT NULL DEFAULT 50.0,
    RatingDEF           REAL NOT NULL DEFAULT 50.0,
    RatingMID           REAL NOT NULL DEFAULT 50.0,
    RatingFWD           REAL NOT NULL DEFAULT 50.0,
    Rating              REAL NOT NULL DEFAULT 50.0,
    CreatedAt           TEXT NOT NULL,
    UpdatedAt           TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS UX_Player_Username ON Player(Username);

CREATE TABLE IF NOT EXISTS Match (
    Id                  TEXT PRIMARY KEY,
    Date                TEXT NOT NULL,
    Status              TEXT NOT NULL DEFAULT 'PENDING',
    ActiveVotePlayerId  TEXT NULL,
    CreatedAt           TEXT NOT NULL,
    UpdatedAt           TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS MatchPlayer (
    Id            TEXT PRIMARY KEY,
    MatchId       TEXT NOT NULL,
    PlayerId      TEXT NOT NULL,
    Team          TEXT NOT NULL,
    Position      TEXT NOT NULL,
    EarnedRating  REAL NULL,
    IsApplied     INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (MatchId) REFERENCES Match(Id),
    FOREIGN KEY (PlayerId) REFERENCES Player(Id)
);
CREATE UNIQUE INDEX IF NOT EXISTS UX_MatchPlayer_Match_Player ON MatchPlayer(MatchId, PlayerId);

CREATE TABLE IF NOT EXISTS Vote (
    Id        TEXT PRIMARY KEY,
    MatchId   TEXT NOT NULL,
    VoterId   TEXT NOT NULL,
    TargetId  TEXT NOT NULL,
    Rating    INTEGER NOT NULL,
    FOREIGN KEY (MatchId) REFERENCES Match(Id),
    FOREIGN KEY (VoterId) REFERENCES Player(Id),
    FOREIGN KEY (TargetId) REFERENCES Player(Id)
);
CREATE UNIQUE INDEX IF NOT EXISTS UX_Vote_Match_Voter_Target ON Vote(MatchId, VoterId, TargetId);
