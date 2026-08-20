using System;

namespace HalisahaMvc.Services
{
    /// <summary>
    /// The original Next.js app hardcoded a "+03:00" (Turkey) offset whenever it constructed a
    /// match date, so all stored Match.Date values represent Turkey wall-clock time regardless of
    /// what timezone the server process itself runs in. This rewrite preserves that: Match.Date is
    /// stored as a naive DateTime meaning "Europe/Istanbul local time", and any comparison against
    /// "now" (voting-start gate, upcoming-match sorting) must go through this helper rather than
    /// DateTime.Now/UtcNow directly — the shared host's OS clock/timezone is not guaranteed to be
    /// Turkey time even though the app's own business dates always are.
    /// </summary>
    public static class TurkeyTimeHelper
    {
        private static readonly TimeZoneInfo TurkeyZone = ResolveTurkeyZone();

        private static TimeZoneInfo ResolveTurkeyZone()
        {
            try { return TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time"); } // Windows id
            catch (TimeZoneNotFoundException) { }
            try { return TimeZoneInfo.FindSystemTimeZoneById("Europe/Istanbul"); } // IANA id (Linux/newer Windows)
            catch (TimeZoneNotFoundException) { }
            // Turkey has used a fixed UTC+3 offset with no DST since 2016 — safe last-resort fallback.
            return TimeZoneInfo.CreateCustomTimeZone("Turkey_Fixed", TimeSpan.FromHours(3), "Turkey (fixed UTC+3)", "Turkey (fixed UTC+3)");
        }

        /// <summary>Current wall-clock time in Turkey, as a naive DateTime (same representation Match.Date uses).</summary>
        public static DateTime Now()
        {
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TurkeyZone);
        }
    }
}
