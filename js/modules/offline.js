// ── Offline Earnings ──────────────────────────────────────────────
// Better incentives for returning players.

function applyOffline() {
    const now      = Date.now();
    const sec      = (now - game.lastTime) / 1000;
    const MAX_SECS = 4 * 60 * 60; // cap at 4 hours

    if (sec > 15) {
        const effective = Math.min(sec, MAX_SECS);
        // $2 per second offline = $28,800 max per 4 hours
        const gain = Math.floor(effective * 2);
        earn_coins(gain);
        const hrs  = Math.floor(effective / 3600);
        const mins = Math.floor((effective % 3600) / 60);
        const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`;
        notifyInfo(`⏰ Offline ${timeStr}: +$${gain.toLocaleString()}`);
    }

    game.lastTime = now;
}
