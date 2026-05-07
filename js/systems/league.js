const league = {
    currentRace: 1,
    totalRaces: 10,
    standings: []
};

function initLeague() {
    if (league.standings.length > 0) return;

    RIVALS.forEach(r => {
        league.standings.push({ name: r.name, points: 0 });
    });

    league.standings.push({ name: "Jugador", points: 0 });
}

function awardLeaguePoints(name, pos) {
    const pts = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    const entry = league.standings.find(t => t.name === name);
    if (!entry) return;
    entry.points += pts[pos - 1] || 0;
}

function renderLeague() {
    const el = document.getElementById("leagueContent");
    if (!el) return;

    // If a race/series is mid-flow in league mode, don't overwrite the race content
    if (raceState && raceState.leagueMode && raceState.phase !== "menu") return;

    const sorted = league.standings.slice().sort((a, b) => b.points - a.points);

    const standingsRows = sorted.map((t, i) => {
        const isPlayer = t.name === "Jugador";
        const posIcon = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        return `
            <div class="league-row ${isPlayer ? "player-row" : ""}">
                <span class="lg-pos">${posIcon}</span>
                <span class="lg-name">${isPlayer ? "Tú" : t.name}</span>
                <span class="lg-pts">${t.points}pts</span>
            </div>
        `;
    }).join("");

    el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title">🏆 LIGA</div>
            <div class="race-divider">INICIA UN CAMPEONATO</div>
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
