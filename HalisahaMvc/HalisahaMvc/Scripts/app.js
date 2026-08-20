(function () {
    "use strict";

    // ---- Countdown timer (port of CountdownTimer.tsx) ----
    function initCountdown() {
        var el = document.getElementById("countdown-timer");
        if (!el) return;
        var target = new Date(el.getAttribute("data-target")).getTime();

        function tick() {
            var distance = target - Date.now();
            if (distance < 0) {
                el.textContent = "VAKİT GELDİ";
                clearInterval(timer);
                return;
            }
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var parts = [];
            if (days > 0) parts.push(days + "g");
            parts.push(String(hours).padStart(2, "0") + "s");
            parts.push(String(mins).padStart(2, "0") + "d");
            el.textContent = parts.join(" ");
        }
        var timer = setInterval(tick, 1000);
        tick();
    }

    // ---- Auto-refresh polling (port of AutoRefreshClient.tsx: 3s while voting, else 20s) ----
    function initAutoRefresh() {
        var dashboard = document.querySelector(".player-dashboard");
        if (!dashboard) return;
        var hasVoting = dashboard.getAttribute("data-has-voting") === "true";
        setInterval(function () { window.location.reload(); }, hasVoting ? 3000 : 20000);
    }

    // ---- Change password modal ----
    function initChangePassword() {
        var form = document.getElementById("change-password-form");
        if (!form) return;
        form.addEventListener("submit", function (e) {
            var pw = document.getElementById("cp-password").value;
            var confirm = document.getElementById("cp-password-confirm").value;
            var errorEl = document.getElementById("cp-client-error");
            if (pw !== confirm) {
                e.preventDefault();
                errorEl.textContent = "Şifreler eşleşmiyor.";
                errorEl.style.display = "block";
                return;
            }
            if (pw.length < 4) {
                e.preventDefault();
                errorEl.textContent = "Şifre en az 4 karakter olmalıdır.";
                errorEl.style.display = "block";
                return;
            }
            errorEl.style.display = "none";
        });
    }

    // ---- Live vote modal ----
    function initLiveVote() {
        var modal = document.getElementById("live-vote-modal");
        if (!modal) return;
        var slider = document.getElementById("vote-rating-slider");
        var valueEl = document.getElementById("vote-rating-value");
        var submitBtn = document.getElementById("vote-submit-btn");
        var pendingEl = document.getElementById("live-vote-pending");
        var successEl = document.getElementById("live-vote-success");

        slider.addEventListener("input", function () { valueEl.textContent = slider.value; });

        if (modal.getAttribute("data-has-voted") === "true") {
            pendingEl.style.display = "none";
            successEl.style.display = "block";
            return;
        }

        var submitted = false;
        submitBtn.addEventListener("click", function () {
            if (submitted) return;
            submitted = true;
            submitBtn.disabled = true;

            var tokenInput = document.querySelector("#vote-af-form input[name='__RequestVerificationToken']");
            var body = new URLSearchParams();
            body.set("matchId", modal.getAttribute("data-match-id"));
            body.set("targetId", modal.getAttribute("data-target-id"));
            body.set("rating", slider.value);
            if (tokenInput) body.set("__RequestVerificationToken", tokenInput.value);

            fetch(window.HalisahaPlayer.voteUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body.toString()
            }).then(function () {
                pendingEl.style.display = "none";
                successEl.style.display = "block";
            }).catch(function () {
                // Network hiccup: still show success, matching the original's
                // "always shows success" quirk on the client regardless of server outcome.
                pendingEl.style.display = "none";
                successEl.style.display = "block";
            });
        });
    }

    // ---- Leaderboard expand/collapse ----
    function initLeaderboard() {
        var toggle = document.getElementById("leaderboard-toggle");
        if (!toggle) return;
        var expanded = false;
        toggle.addEventListener("click", function () {
            expanded = !expanded;
            document.querySelectorAll(".leaderboard-hidden").forEach(function (row) {
                row.style.display = expanded ? "" : "none";
            });
            toggle.textContent = expanded ? "Sıralamayı Gizle" : "Tüm Sıralamayı Gör (" + toggle.getAttribute("data-total") + " Oyuncu)";
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initCountdown();
        initAutoRefresh();
        initChangePassword();
        initLiveVote();
        initLeaderboard();
    });
})();
