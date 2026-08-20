using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using HalisahaMvc.Models.ViewModels;

namespace HalisahaMvc.Helpers
{
    /// <summary>
    /// Verbatim port of PlayerFormChart.tsx's SVG generation — same 360x130 viewBox, same
    /// padding constants, same linear (non-bezier) point spacing and min/max±3 y-scaling.
    /// </summary>
    public static class ChartHelpers
    {
        private const double Width = 360;
        private const double Height = 130;
        private const double PaddingX = 35;
        private const double PaddingTop = 25;
        private const double PaddingBottom = 30;

        public static IHtmlString PlayerFormChart(this HtmlHelper html, List<FormPointViewModel> matches)
        {
            if (matches == null || matches.Count < 2)
            {
                return new HtmlString(
                    "<div class=\"form-chart form-chart-empty\">" +
                    "<h3>Son 5 Maç Form Grafiği</h3>" +
                    "<p>Grafik oluşması için en az 2 tamamlanmış maç verisi gereklidir.</p>" +
                    "</div>");
            }

            var chartData = matches.Count > 5 ? matches.Skip(matches.Count - 5).ToList() : matches;
            var ratings = chartData.Select(m => Math.Ceiling(m.EarnedRating)).ToList();

            double firstRating = ratings[0];
            double lastRating = ratings[ratings.Count - 1];
            double delta = lastRating - firstRating;

            double minVal = ratings.Min() - 3;
            double maxVal = ratings.Max() + 3;
            double range = (maxVal - minVal) != 0 ? (maxVal - minVal) : 1;

            var points = new List<(double X, double Y, double Rating, string Date)>();
            for (int i = 0; i < chartData.Count; i++)
            {
                double x = PaddingX + (chartData.Count == 1 ? 0 : (double)i / (chartData.Count - 1)) * (Width - 2 * PaddingX);
                double rating = ratings[i];
                double y = Height - PaddingBottom - ((rating - minVal) / range) * (Height - PaddingTop - PaddingBottom);
                points.Add((x, y, rating, chartData[i].Date));
            }

            bool positive = delta >= 0;
            string lineColor = positive ? "#2563eb" : "#e11d48";
            string gradientColor = positive ? "#3b82f6" : "#f43f5e";
            string labelBg = positive ? "#1e40af" : "#9f1239";

            var sb = new StringBuilder();
            sb.Append("<div class=\"form-chart\">");
            sb.Append("<div class=\"form-chart-header\"><h3>Son 5 Maç Form Grafiği</h3>");
            if (delta > 0)
                sb.Append($"<span class=\"form-delta form-delta-up\">▲ +{F(delta)} OVR Yükseliş 🔥</span>");
            else if (delta < 0)
                sb.Append($"<span class=\"form-delta form-delta-down\">▼ {F(delta)} OVR Düşüş</span>");
            else
                sb.Append("<span class=\"form-delta form-delta-flat\">▬ Dengeli Form</span>");
            sb.Append("</div>");

            sb.Append($"<svg viewBox=\"0 0 {F(Width)} {F(Height)}\" class=\"form-chart-svg\">");
            sb.Append("<defs><linearGradient id=\"formGradient\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">");
            sb.Append($"<stop offset=\"0%\" stop-color=\"{gradientColor}\" stop-opacity=\"0.25\" />");
            sb.Append($"<stop offset=\"100%\" stop-color=\"{gradientColor}\" stop-opacity=\"0\" />");
            sb.Append("</linearGradient></defs>");

            var pathD = "M " + string.Join(" L ", points.Select(p => $"{F(p.X)} {F(p.Y)}"));
            var baseline = Height - PaddingBottom;
            var areaD = $"{pathD} L {F(points[points.Count - 1].X)} {F(baseline)} L {F(points[0].X)} {F(baseline)} Z";

            sb.Append($"<path d=\"{areaD}\" fill=\"url(#formGradient)\" stroke=\"none\" />");
            sb.Append($"<path d=\"{pathD}\" fill=\"none\" stroke=\"{lineColor}\" stroke-width=\"3.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" />");

            foreach (var p in points)
            {
                double labelY = p.Y - 20;
                sb.Append($"<rect x=\"{F(p.X - 14)}\" y=\"{F(labelY)}\" width=\"28\" height=\"15\" rx=\"4\" fill=\"{labelBg}\" />");
                sb.Append($"<text x=\"{F(p.X)}\" y=\"{F(labelY + 11)}\" text-anchor=\"middle\" fill=\"white\" font-size=\"10\" font-weight=\"bold\">{F(p.Rating)}</text>");
                sb.Append($"<circle cx=\"{F(p.X)}\" cy=\"{F(p.Y)}\" r=\"5\" fill=\"white\" stroke=\"{lineColor}\" stroke-width=\"3\" />");
                sb.Append($"<text x=\"{F(p.X)}\" y=\"{F(Height - 8)}\" text-anchor=\"middle\" fill=\"currentColor\" font-size=\"9\">{System.Web.HttpUtility.HtmlEncode(p.Date)}</text>");
            }

            sb.Append("</svg></div>");
            return new HtmlString(sb.ToString());
        }

        private static string F(double value)
        {
            return value.ToString("0.##", CultureInfo.InvariantCulture);
        }
    }
}
