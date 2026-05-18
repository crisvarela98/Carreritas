const RIVALS = [
    { name: "Hamilton",   basePace: 82 },
    { name: "Verstappen", basePace: 81 },
    { name: "Leclerc",    basePace: 83 },
    { name: "Norris",     basePace: 84 },
    { name: "Sainz",      basePace: 85 },
    { name: "Russell",    basePace: 84 },
    { name: "Alonso",     basePace: 86 },
    { name: "Pérez",      basePace: 86 },
    { name: "Piastri",    basePace: 85 },
];

const raceState = {
    phase: "menu",
    seriesMode: 1,
    seriesRace: 0,
    seriesPoints: {},
    grid: [],
    standings: [],
    prevStandings: [],
    lap: 0,
    totalLaps: 5,
    raceInterval: null,
    leagueMode: false,
    renderTarget: "raceContent",
    _pendingReward: null  // used for rewarded-ad double-reward hook
};

function getRaceEl() {
    return document.getElementById(raceState.renderTarget);
}

function formatLapTime(secs) {
    const m   = Math.floor(secs / 60);
    const rem = secs % 60;
    const s   = rem < 10 ? "0" + rem.toFixed(3) : rem.toFixed(3);
    return `${m}:${s}`;
}

// ── Player pace based on upgrades ────────────────────────────────
function getPlayerPace() {
    const base         = 92;
    const lvlBonus     = (game.workshop.level       - 1) * 4;
    const repBonus     = Math.min(game.reputation * 0.15, 10);
    const sponsorBonus = game.sponsor ? 2 : 0;
    const engineBonus  = (game.car.engine       - 1) * 1.8;
    const transBonus   = (game.car.transmission - 1) * 1.2;
    const aeroBonus    = (game.car.aero         - 1) * 1.0;
    const wheelsBonus  = (game.car.wheels       - 1) * 0.8;
    return Math.max(55, base - lvlBonus - repBonus - sponsorBonus
                             - engineBonus - transBonus - aeroBonus - wheelsBonus);
}

// ── Navigation ───────────────────────────────────────────────────
function showRaceMenu() {
    if (raceState.leagueMode) {
        raceState.leagueMode  = false;
        raceState.renderTarget = "raceContent";
        raceState.phase        = "menu";
        renderLeague();
        return;
    }
    raceState.phase = "menu";
    renderRaceScreen();
}

// ── Race screen entry ─────────────────────────────────────────────
function renderRaceScreen() {
    const el = getRaceEl();
    if (!el) return;
    if (raceState.phase !== "menu") return;

    const pace = getPlayerPace().toFixed(2);
    const best = game.bestLapTime ? formatLapTime(game.bestLapTime) : "—";

    el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title">🏎 CARRERA RÁPIDA</div>

            <div class="race-stats-row">
                <div class="race-stat-box">
                    <div class="rsb-label">Ritmo</div>
                    <div class="rsb-value">${pace}s</div>
                </div>
                <div class="race-stat-box">
                    <div class="rsb-label">Mejor vuelta</div>
                    <div class="rsb-value small">${best}</div>
                </div>
                <div class="race-stat-box">
                    <div class="rsb-label">Poles</div>
                    <div class="rsb-value">${game.poleCount}</div>
                </div>
            </div>

            <div class="race-divider">CLASIFICACIÓN + CARRERA ÚNICA</div>
            <button class="rbtn accent-btn" onclick="startQualy(1)">🚦 Iniciar clasificación</button>
        </div>

        ${game.raceResults.length > 0 ? renderRaceHistory() : ""}
    `;
}

function renderRaceHistory() {
    const last5 = game.raceResults.slice(-5).reverse();
    const rows = last5.map(r => {
        const d    = new Date(r.timestamp);
        const time = d.toLocaleDateString("es", { month: "short", day: "numeric" });
        const medal = r.position === 1 ? "🥇" : r.position === 2 ? "🥈" : r.position === 3 ? "🥉" : `${r.position}°`;
        return `<div class="hist-row">
            <span class="hist-medal">${medal}</span>
            <span class="hist-reward">+$${r.moneyEarned.toLocaleString()}</span>
            <span class="hist-pts">+${r.leaguePoints}pts</span>
            <span class="hist-date">${time}</span>
        </div>`;
    }).join("");

    return `<div class="race-card">
        <div class="race-divider">ÚLTIMAS CARRERAS</div>
        ${rows}
    </div>`;
}

// ── League entry ──────────────────────────────────────────────────
function startLeagueChampionship(n) {
    raceState.leagueMode   = true;
    raceState.renderTarget = "leagueContent";
    startQualy(n);
}

// ── Qualifying ────────────────────────────────────────────────────
function startQualy(mode) {
    raceState.seriesMode   = mode;
    raceState.seriesRace   = 0;
    raceState.seriesPoints = {};
    raceState.phase        = "qualy";

    const pace     = getPlayerPace();
    const variance = (Math.random() - 0.5) * 5;
    const playerTime = Math.max(58, pace + variance);

    raceState.grid = RIVALS.map(r => ({
        name: r.name,
        qualyTime: r.basePace + (Math.random() - 0.5) * 8,
        basePace:  r.basePace + (Math.random() - 0.3) * 3
    }));
    raceState.grid.push({ name: "Tú", qualyTime: playerTime, basePace: pace });

    const rivalBest = Math.min(...raceState.grid.filter(r => r.name !== "Tú").map(r => r.qualyTime));
    const gotPole   = playerTime < rivalBest;
    if (gotPole) game.poleCount++;
    if (!game.bestLapTime || playerTime < game.bestLapTime) game.bestLapTime = playerTime;

    runQualyAnimation(playerTime, gotPole);

    // FTUE step 5 progress
    if (window.FTUEManager) FTUEManager.onRaceStarted();
}

function runQualyAnimation(total, gotPole) {
    const s1 = total * (0.28 + Math.random() * 0.04);
    const s2 = total * (0.36 + Math.random() * 0.04);
    const s3 = total - s1 - s2;

    const el = getRaceEl();
    if (!el) return;

    el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title">⏱ VUELTA CLASIFICATORIA</div>
            <div class="qualy-car-anim">🏎</div>
            <div class="qualy-sectors">
                <div class="sector-box">
                    <span class="sec-label">SECTOR 1</span>
                    <span class="sec-time" id="t1">· · ·</span>
                </div>
                <div class="sector-box">
                    <span class="sec-label">SECTOR 2</span>
                    <span class="sec-time" id="t2">· · ·</span>
                </div>
                <div class="sector-box">
                    <span class="sec-label">SECTOR 3</span>
                    <span class="sec-time" id="t3">· · ·</span>
                </div>
            </div>
            <div class="qualy-total-wrap" id="qualyTotalWrap">
                <span class="qualy-label">TIEMPO TOTAL</span>
                <span class="qualy-total-time" id="qualyTotal">—:—.———</span>
            </div>
        </div>
    `;

    setTimeout(() => {
        const t = document.getElementById("t1");
        if (t) { t.textContent = s1.toFixed(3) + "s"; t.classList.add("done"); }
    }, 1100);
    setTimeout(() => {
        const t = document.getElementById("t2");
        if (t) { t.textContent = s2.toFixed(3) + "s"; t.classList.add("done"); }
    }, 2400);
    setTimeout(() => {
        const t = document.getElementById("t3");
        if (t) { t.textContent = s3.toFixed(3) + "s"; t.classList.add("done"); }
    }, 3700);
    setTimeout(() => {
        const t = document.getElementById("qualyTotal");
        if (t) { t.textContent = formatLapTime(total); t.classList.add("done"); }
        if (gotPole) {
            const w = document.getElementById("qualyTotalWrap");
            if (w) w.insertAdjacentHTML("beforeend", `<div class="pole-banner">🟣 POLE POSITION</div>`);
        }
        raceState.grid.sort((a, b) => a.qualyTime - b.qualyTime);
        setTimeout(() => showGrid(gotPole), 1400);
    }, 5000);
}

// ── Grid ──────────────────────────────────────────────────────────
function showGrid(gotPole) {
    raceState.phase = "grid";
    const el = getRaceEl();
    if (!el) return;

    const rows = raceState.grid.map((r, i) => `
        <div class="grid-row ${r.name === "Tú" ? "player-row" : ""}">
            <span class="grid-pos">${i + 1}</span>
            <span class="grid-name">${r.name}</span>
            <span class="grid-qtime">${formatLapTime(r.qualyTime)}</span>
        </div>
    `).join("");

    const seriesLabel = raceState.seriesMode > 1
        ? `<div class="race-divider">CARRERA ${raceState.seriesRace + 1} DE ${raceState.seriesMode}</div>`
        : "";

    el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title">🚦 PARRILLA DE SALIDA</div>
            ${gotPole ? `<div class="pole-banner">🟣 POLE POSITION — MEJOR TIEMPO</div>` : ""}
            ${seriesLabel}
            <div class="grid-table">${rows}</div>
            <button class="rbtn accent-btn" onclick="beginRace()">🚥 ¡ARRANCAR!</button>
        </div>
    `;
}

// ── Race loop ─────────────────────────────────────────────────────
function beginRace() {
    raceState.phase        = "racing";
    raceState.lap          = 0;
    raceState.standings    = raceState.grid.map((r, i) => ({ ...r, pos: i + 1 }));
    raceState.prevStandings = raceState.standings.map(s => ({ ...s }));
    renderRaceLap();
    raceState.raceInterval = setInterval(doRaceLap, 1300);
}

function doRaceLap() {
    raceState.lap++;
    if (raceState.lap > raceState.totalLaps) {
        clearInterval(raceState.raceInterval);
        endRace();
        return;
    }

    const pace = getPlayerPace();
    raceState.prevStandings = raceState.standings.map(s => ({ ...s }));

    raceState.standings = raceState.standings.map(r => ({
        ...r,
        lapTime: r.name === "Tú"
            ? pace + (Math.random() - 0.5) * 3
            : r.basePace + (Math.random() - 0.5) * 4
    }));

    raceState.standings.sort((a, b) => a.lapTime - b.lapTime);
    raceState.standings = raceState.standings.map((r, i) => ({ ...r, pos: i + 1 }));
    renderRaceLap();
}

function renderRaceLap() {
    const el = getRaceEl();
    if (!el) return;

    const pct        = Math.round((raceState.lap / raceState.totalLaps) * 100);
    const seriesInfo = raceState.seriesMode > 1
        ? `Carrera ${raceState.seriesRace + 1}/${raceState.seriesMode}`
        : "Carrera rápida";

    const rows = raceState.standings.map((r, i) => {
        const prevIdx = raceState.prevStandings.findIndex(s => s.name === r.name);
        const delta   = prevIdx - i;
        const arrow   = delta > 0
            ? `<span class="pos-up">▲</span>`
            : delta < 0 ? `<span class="pos-dn">▼</span>`
            : `<span class="pos-eq">—</span>`;
        return `
            <div class="race-live-row ${r.name === "Tú" ? "player-row" : ""}">
                <span class="rlpos">${i + 1}</span>
                ${arrow}
                <span class="rlname">${r.name}</span>
            </div>
        `;
    }).join("");

    el.innerHTML = `
        <div class="race-card">
            <div class="race-live-header">
                <span class="race-live-title">🏎 ${seriesInfo}</span>
                <span class="lap-badge">V${raceState.lap}/${raceState.totalLaps}</span>
            </div>
            <div class="lap-track">
                <div class="lap-track-fill" style="width:${pct}%"></div>
            </div>
            <div class="live-standings">${rows}</div>
        </div>
    `;
}

// ── End of race ───────────────────────────────────────────────────
function endRace() {
    const playerIdx   = raceState.standings.findIndex(r => r.name === "Tú");
    const pos         = playerIdx + 1;

    const cashTable      = [0, 2500, 1500, 1000, 700, 500, 300, 200, 100, 50, 25];
    const xpTable        = [0, 300,  200,  150,  100,  80,  60,  40,  20,  10,  5];
    const leaguePtsTable = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

    const cash        = cashTable[pos]        || 0;
    const xp          = xpTable[pos]          || 0;
    const leaguePts   = leaguePtsTable[pos - 1] || 0;

    // Store pending reward for possible rewarded-ad doubling
    raceState._pendingReward = { cash, xp, leaguePts, pos };

    run_race(pos, cash, xp, leaguePts);
}

// ── run_race(): apply results, save to history ────────────────────
function run_race(pos, cash, xp, leaguePts) {
    game.money += cash;
    addXP(xp);
    if (pos <= 3) game.reputation += (4 - pos);

    if (pos === 1)      game.medals.gold++;
    else if (pos === 2) game.medals.silver++;
    else if (pos === 3) game.medals.bronze++;

    // puntos liga
    results.forEach((r,i)=>{
        awardLeaguePoints(r.name, i+1);
    });

    notify("Terminaste " + pos + "° | $" + reward);

    league.currentRace++;

    renderLeague();
}
