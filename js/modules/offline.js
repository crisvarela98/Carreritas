// ── Offline Earnings ──────────────────────────────────────────────
// Balanced: small passive income that doesn't break economy.

function applyOffline() {
    const now      = Date.now();
    const sec      = (now - game.lastTime) / 1000;
    const MAX_SECS = 2 * 60 * 60; // cap at 2 hours

    if (sec > 15) {
        const effective = Math.min(sec, MAX_SECS);
        // $0.2 per second offline = $720 max per 2 hours
        const gain = Math.floor(effective * 0.2);
        earn_coins(gain);
        notifyInfo(`Offline: +$${gain.toLocaleString()} por ${Math.floor(effective / 60)} min`);
    }

    game.lastTime = now;
}
