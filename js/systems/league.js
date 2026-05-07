// ── League init ───────────────────────────────────────────────────
function initLeague() {
    if (game.league.standings.length > 0) return;

    RIVALS.forEach(r => {
        game.league.standings.push({ name: r.name, points: 0 });
    });

    game.league.standings.push({ name: "Jugador", points: 0 });
}

// ── Award points (called from race.js) ────────────────────────────
function awardLeaguePoints(name, pos) {
    const pts = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    const entry = game.league.standings.find(t => t.name === name);
    if (!entry) return;
    entry.points += pts[pos - 1] || 0;
}

function calculate_league_points() {
    return game.league.standings.slice().sort((a, b) => b.points - a.points);
}

// ── Render ────────────────────────────────────────────────────────
function renderLeague() {
    const el = document.getElementById("leagueContent");
    if (!el) return;

    if (raceState && raceState.leagueMode && raceState.phase !== "menu") return;

    const sorted = calculate_league_points();
    const playerEntry = game.league.standings.find(t => t.name === "Jugador");
    const playerPts   = playerEntry ? playerEntry.points : 0;
    const playerRank  = sorted.findIndex(t => t.name === "Jugador") + 1;

    const standingsRows = sorted.map((t, i) => {
        const isPlayer = t.name === "Jugador";
        const posIcon  = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        return `
            <div class="league-row ${isPlayer ? "player-row" : ""}">
                <span class="lg-pos">${posIcon}</span>
                <span class="lg-name">${isPlayer ? (game.playerName || "Tú") : t.name}</span>
                <span class="lg-pts">${t.points} pts</span>
            </div>
        `;
    }).join("");

    el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title">🏆 LIGA</div>

            <div class="league-summary-row">
                <div class="lsm-box">
                    <div class="lsm-label">Tu posición</div>
                    <div class="lsm-val">${playerRank}°</div>
                </div>
                <div class="lsm-box">
                    <div class="lsm-label">Tus puntos</div>
                    <div class="lsm-val">${playerPts}</div>
                </div>
                <div class="lsm-box">
                    <div class="lsm-label">Carreras</div>
                    <div class="lsm-val">${game.league.currentRace - 1}</div>
                </div>
            </div>

            <div class="race-divider">INICIAR CAMPEONATO</div>
            <button class="rbtn" onclick="startLeagueChampionship(3)">🏆 Campeonato — 3 carreras</button>
            <button class="rbtn" onclick="startLeagueChampionship(5)">🏆 Campeonato — 5 carreras</button>
            <button class="rbtn gold-btn" onclick="startLeagueChampionship(10)">👑 Campeonato — 10 carreras</button>
        </div>

        <div class="race-card">
            <div class="race-divider">CLASIFICACIÓN GENERAL</div>
            <div class="league-standings">${standingsRows}</div>
        </div>
    `;
}
