// ── Points Calculator ─────────────────────────────────────────────
const PointsCalculator = {
    POINTS: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],

    forPosition(pos) {
        return this.POINTS[pos - 1] || 0;
    }
};

// ── League Manager ────────────────────────────────────────────────
const LeagueManager = {

    // Initialize standings for a vehicle's league
    init(vehicleId) {
        const lg      = game.leagues[vehicleId];
        const rivals  = VEHICLE_RIVALS[vehicleId] || [];
        if (!lg) return;

        // Add any missing rivals
        rivals.forEach(r => {
            if (!lg.standings.find(s => s.name === r.name)) {
                lg.standings.push({ name: r.name, points: 0 });
            }
        });

        // Ensure player entry exists
        if (!lg.standings.find(s => s.name === "Jugador")) {
            lg.standings.push({ name: "Jugador", points: 0 });
        }
    },

    // Add points for a race result (player + rivals)
    add_league_points(vehicleId, standings) {
        const lg = game.leagues[vehicleId];
        if (!lg) return;

        standings.forEach((entry, i) => {
            const pts  = PointsCalculator.forPosition(i + 1);
            const name = entry.name === "Tú" ? "Jugador" : entry.name;
            const rec  = lg.standings.find(s => s.name === name);
            if (rec) rec.points += pts;
        });

        lg.currentRace++;
    },

    // Sorted standings for a vehicle league
    getStandings(vehicleId) {
        const lg = game.leagues[vehicleId];
        if (!lg || !Array.isArray(lg.standings)) return [];
        return lg.standings.slice().sort((a, b) => b.points - a.points);
    },

    // Player rank in a league
    getPlayerRank(vehicleId) {
        const sorted = this.getStandings(vehicleId);
        return sorted.findIndex(s => s.name === "Jugador") + 1;
    },

    // Player points in a league
    getPlayerPoints(vehicleId) {
        const lg = game.leagues[vehicleId];
        if (!lg) return 0;
        const entry = lg.standings.find(s => s.name === "Jugador");
        return entry ? entry.points : 0;
    },

    // calculate_league_points: alias
    calculate_league_points(vehicleId) {
        return this.getStandings(vehicleId);
    }
};

// ── Legacy alias for old code ──────────────────────────────────────
function awardLeaguePoints(name, pos) {
    // handled by LeagueManager.add_league_points in race.js
}

// ── Current vehicle league tab state ─────────────────────────────
let leagueTab = "car";

function renderLeague() {
    const el = document.getElementById("leagueContent");
    if (!el) return;

    if (RaceManager && RaceManager.state.leagueMode && RaceManager.state.phase !== "menu") return;

    const ownedVehicles = Object.entries(VEHICLE_CATALOG).filter(([id]) => game.vehicles[id]?.owned);

    const tabsHtml = ownedVehicles.map(([id, def]) => `
        <button class="wtab ${leagueTab === id ? "wtab-active" : ""}"
                onclick="setLeagueTab('${id}')"
                style="${leagueTab === id ? `border-bottom-color:${def.color}` : ""}">
            ${def.icon} ${def.name}
        </button>
    `).join("");

    const vehicleId = leagueTab;
    const def       = VEHICLE_CATALOG[vehicleId];
    const sorted    = LeagueManager.getStandings(vehicleId);
    const playerPts = LeagueManager.getPlayerPoints(vehicleId);
    const playerRnk = LeagueManager.getPlayerRank(vehicleId);
    const races     = Math.max(0, (game.leagues[vehicleId]?.currentRace || 1) - 1);

    const rowsHtml = sorted.map((t, i) => {
        const isPlayer = t.name === "Jugador";
        const posIcon  = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        return `
        <div class="league-row ${isPlayer ? "player-row" : ""}">
            <span class="lg-pos">${posIcon}</span>
            <span class="lg-name">${isPlayer ? (game.playerName || "Tú") : t.name}</span>
            <span class="lg-pts">${t.points} pts</span>
        </div>`;
    }).join("");

    el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title" style="color:${def.color}">🏆 LIGA</div>
            <div class="wtab-bar" style="flex-wrap:wrap;gap:4px">${tabsHtml}</div>

            <div class="league-summary-row">
                <div class="lsm-box"><div class="lsm-label">Posición</div><div class="lsm-val" style="color:${def.color}">${playerRnk}°</div></div>
                <div class="lsm-box"><div class="lsm-label">Puntos</div><div class="lsm-val">${playerPts}</div></div>
                <div class="lsm-box"><div class="lsm-label">Carreras</div><div class="lsm-val">${races}</div></div>
            </div>

            <div class="race-divider">INICIAR CAMPEONATO — ${def.icon} ${def.name}</div>
            <button class="rbtn" onclick="RaceManager.startLeague('${vehicleId}', 3)">🏆 3 carreras</button>
            <button class="rbtn" onclick="RaceManager.startLeague('${vehicleId}', 5)">🏆 5 carreras</button>
            <button class="rbtn gold-btn" onclick="RaceManager.startLeague('${vehicleId}', 10)">👑 10 carreras</button>
        </div>

        <div class="race-card">
            <div class="race-divider">CLASIFICACIÓN — ${def.icon}</div>
            <div class="league-standings">${rowsHtml || '<div class="empty-row">Sin carreras disputadas aún</div>'}</div>
        </div>
    `;
}

function setLeagueTab(vehicleId) {
    leagueTab = vehicleId;
    renderLeague();
}

// ── Initialise all leagues ────────────────────────────────────────
function initAllLeagues() {
    for (const id of Object.keys(VEHICLE_CATALOG)) {
        if (game.vehicles[id]?.owned) {
            LeagueManager.init(id);
        }
    }
}
