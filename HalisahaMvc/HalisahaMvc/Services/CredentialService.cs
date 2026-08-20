using System;
using System.Text;
using System.Text.RegularExpressions;
using HalisahaMvc.Services.Repositories;

namespace HalisahaMvc.Services
{
    /// <summary>
    /// Username/password generation (verbatim port of players/actions.ts's slugify/generatePassword)
    /// plus BCrypt hashing helpers. The original app stored passwords in plaintext; this rewrite
    /// hashes them (confirmed deviation, see plan §"Decisions locked in").
    /// </summary>
    public static class CredentialService
    {
        /// <summary>
        /// Exact port of the original JS slugify(): lowercase, spaces -> '.', explicit Turkish
        /// char folding (done in this order, after lowercasing), strip remaining special chars,
        /// collapse/trim hyphens.
        /// </summary>
        public static string Slugify(string text)
        {
            if (text == null) return string.Empty;

            // Fold case + Turkish characters in one pass over the ORIGINAL string, char by char.
            // (Doing this before a plain ToLowerInvariant() avoids .NET's invariant lowering of
            // 'İ' into a two-character "i" + combining-dot sequence, which would otherwise survive
            // as a stray combining mark — the original JS regex classes handle this implicitly.)
            var sb = new StringBuilder(text.Length);
            foreach (var ch in text)
            {
                switch (ch)
                {
                    case 'ç': case 'Ç': sb.Append('c'); break;
                    case 'ğ': case 'Ğ': sb.Append('g'); break;
                    case 'ı': case 'I': case 'İ': case 'i': sb.Append('i'); break;
                    case 'ö': case 'Ö': sb.Append('o'); break;
                    case 'ş': case 'Ş': sb.Append('s'); break;
                    case 'ü': case 'Ü': sb.Append('u'); break;
                    default: sb.Append(char.ToLowerInvariant(ch)); break;
                }
            }

            var s = sb.ToString();
            s = Regex.Replace(s, @"\s+", ".");
            s = Regex.Replace(s, @"[^\w\-.]+", "");
            s = Regex.Replace(s, @"-{2,}", "-");
            s = Regex.Replace(s, @"^-+", "");
            s = Regex.Replace(s, @"-+$", "");
            return s;
        }

        private static readonly Random Rng = new Random();
        private const string PasswordChars = "abcdefghijklmnopqrstuvwxyz0123456789";

        /// <summary>6-char random alphanumeric password (same charset/length as the original).</summary>
        public static string GeneratePassword()
        {
            var sb = new StringBuilder(6);
            lock (Rng)
            {
                for (int i = 0; i < 6; i++)
                {
                    sb.Append(PasswordChars[Rng.Next(PasswordChars.Length)]);
                }
            }
            return sb.ToString();
        }

        /// <summary>Generates a unique username by slugifying the name and appending a numeric suffix on collision.</summary>
        public static string GenerateUniqueUsername(string name)
        {
            var baseUsername = Slugify(name);
            var candidate = baseUsername;
            int suffix = 1;
            while (PlayerRepository.UsernameExists(candidate))
            {
                candidate = baseUsername + suffix;
                suffix++;
            }
            return candidate;
        }

        public static string HashPassword(string plainPassword)
        {
            return BCrypt.Net.BCrypt.HashPassword(plainPassword);
        }

        public static bool VerifyPassword(string plainPassword, string hash)
        {
            if (string.IsNullOrEmpty(hash)) return false;
            try
            {
                return BCrypt.Net.BCrypt.Verify(plainPassword, hash);
            }
            catch (BCrypt.Net.SaltParseException)
            {
                // Defensive: a hash that isn't valid BCrypt (e.g. leftover plaintext from a
                // pre-migration row) never matches, rather than throwing into a 500.
                return false;
            }
        }
    }
}
