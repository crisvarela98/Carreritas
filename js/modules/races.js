// ── Race Circuits (10 per vehicle type = one full season) ─────────
const RACE_CIRCUITS = {
    car: [
        { name: "Circuito de Madrid",     flag: "🇪🇸", diff: 2, weather: "☀️" },
        { name: "Oval de Nevada",          flag: "🇺🇸", diff: 1, weather: "🌤" },
        { name: "Curva del Diablo",        flag: "🇲🇽", diff: 4, weather: "⛅" },
        { name: "Circuit de Monaco",       flag: "🇲🇨", diff: 5, weather: "☀️" },
        { name: "Pista de Tokio",          flag: "🇯🇵", diff: 3, weather: "🌧" },
        { name: "Autódromo São Paulo",     flag: "🇧🇷", diff: 3, weather: "⛅" },
        { name: "Silverstone Circuit",     flag: "🇬🇧", diff: 4, weather: "🌥" },
        { name: "Circuito de Dubái",       flag: "🇦🇪", diff: 2, weather: "☀️" },
        { name: "Pista del Sahara",        flag: "🇲🇦", diff: 3, weather: "🌵" },
        { name: "Gran Final — Monza",      flag: "🇮🇹", diff: 5, weather: "☀️" },
    ],
    moto: [
        { name: "Circuit de Barcelona",    flag: "🇪🇸", diff: 3, weather: "☀️" },
        { name: "TT de Assen",             flag: "🇳🇱", diff: 4, weather: "🌧" },
        { name: "Mugello",                 flag: "🇮🇹", diff: 4, weather: "☀️" },
        { name: "Silverstone",             flag: "🇬🇧", diff: 3, weather: "🌥" },
        { name: "Sachsenring",             flag: "🇩🇪", diff: 3, weather: "⛅" },
        { name: "Twin Ring Motegi",        flag: "🇯🇵", diff: 4, weather: "⛅" },
        { name: "Phillip Island",          flag: "🇦🇺", diff: 3, weather: "🌤" },
        { name: "Sepang International",    flag: "🇲🇾", diff: 2, weather: "🌧" },
        { name: "Circuit Ricardo Tormo",   flag: "🇪🇸", diff: 5, weather: "☀️" },
        { name: "Gran Final — Lusail",     flag: "🇶🇦", diff: 5, weather: "🌙" },
    ],
    rally: [
        { name: "Monte-Carlo",             flag: "🇲🇨", diff: 5, weather: "❄️" },
        { name: "Rally de Suecia",         flag: "🇸🇪", diff: 4, weather: "❄️" },
        { name: "Rally de Portugal",       flag: "🇵🇹", diff: 3, weather: "☀️" },
        { name: "Rally Italia Sardegna",   flag: "🇮🇹", diff: 4, weather: "☀️" },
        { name: "Rally de Finlandia",      flag: "🇫🇮", diff: 3, weather: "🌲" },
        { name: "Rallye Deutschland",      flag: "🇩🇪", diff: 4, weather: "⛅" },
        { name: "Wales Rally GB",          flag: "🇬🇧", diff: 4, weather: "🌧" },
        { name: "Rally de Argentina",      flag: "🇦🇷", diff: 3, weather: "⛅" },
        { name: "Rally Australia",         flag: "🇦🇺", diff: 2, weather: "☀️" },
        { name: "Gran Final — Bretaña",    flag: "🏁",  diff: 5, weather: "🌧" },
    ],
    formula: [
        { name: "Bahrain GP",              flag: "🇧🇭", diff: 2, weather: "☀️" },
        { name: "Saudi Arabia GP",         flag: "🇸🇦", diff: 3, weather: "🌙" },
        { name: "Australian GP",           flag: "🇦🇺", diff: 3, weather: "☀️" },
        { name: "Japanese GP — Suzuka",    flag: "🇯🇵", diff: 5, weather: "⛅" },
        { name: "Miami GP",                flag: "🇺🇸", diff: 3, weather: "☀️" },
        { name: "Monaco GP",               flag: "🇲🇨", diff: 5, weather: "☀️" },
        { name: "Belgian GP — Spa",        flag: "🇧🇪", diff: 4, weather: "🌧" },
        { name: "British GP — Silverstone",flag: "🇬🇧", diff: 4, weather: "🌥" },
        { name: "Italian GP — Monza",      flag: "🇮🇹", diff: 3, weather: "☀️" },
        { name: "Abu Dhabi GP — Final",    flag: "🇦🇪", diff: 4, weather: "🌙" },
    ]
};

const DIFF_LABELS = ["", "Muy fácil", "Fácil", "Media", "Difícil", "Extrema"];

// ── Race Manager ──────────────────────────────────────────────────
const RaceManager = {

    state: {
        phase:         "menu",
        vehicleId:     "car",
        seriesMode:    1,
        seriesRace:    0,
        seriesPoints:  {},
        grid:          [],
        standings:     [],
        prevStandings: [],
        lap:           0,
        totalLaps:     5,
        raceInterval:  null,
        leagueMode:    false,
        renderTarget:  "raceContent",
        _pendingReward: null
    },

    el() {
        return document.getElementById(this.state.renderTarget);
    },

    // ── Entry points ─────────────────────────────────────────────

    // Called when user taps "Quick Race" for a vehicle
    start(vehicleId, mode) {
        this.state.vehicleId   = vehicleId || game.activeVehicle;
        this.state.leagueMode  = false;
        this.state.renderTarget = "raceContent";
        this._startQualy(mode || 1);
    },

    // Called from the unified race screen (counts for league points)
    startLeague(vehicleId, n) {
        this.state.vehicleId    = vehicleId;
        this.state.leagueMode   = true;
        this.state.renderTarget = "raceContent";
        game.activeVehicle      = vehicleId;
        this._startQualy(n || 1);
    },

    // ── Qualifying ───────────────────────────────────────────────

    _startQualy(mode) {
        const s = this.state;
        s.seriesMode   = mode;
        s.seriesRace   = 0;
        s.seriesPoints = {};
        s.phase        = "qualy";

        const vehicleId = s.vehicleId;
        const def       = VEHICLE_CATALOG[vehicleId];
        const rivals    = VEHICLE_RIVALS[vehicleId] || [];
        const pace      = getVehiclePace(vehicleId);

        const playerTime = Math.max(def.basePace * 0.4, pace + (Math.random() - 0.5) * 5);

        s.totalLaps = def.totalLaps || 5;
        s.grid = rivals.map(r => ({
            name:      r.name,
            qualyTime: r.basePace + (Math.random() - 0.5) * 8,
            basePace:  r.basePace + (Math.random() - 0.3) * 3
        }));
        s.grid.push({ name: "Tú", qualyTime: playerTime, basePace: pace });

        const rivalBest = Math.min(...s.grid.filter(r => r.name !== "Tú").map(r => r.qualyTime));
        const gotPole   = playerTime < rivalBest;
        if (gotPole) game.poleCount++;

        if (!game.bestLapTimes[vehicleId] || playerTime < game.bestLapTimes[vehicleId]) {
            game.bestLapTimes[vehicleId] = playerTime;
        }

        this._runQualyAnim(playerTime, gotPole);
        if (window.FTUEManager) FTUEManager.onRaceStarted();
    },

    _runQualyAnim(total, gotPole) {
        const el = this.el();
        if (!el) return;

        const s1 = total * (0.28 + Math.random() * 0.04);
        const s2 = total * (0.36 + Math.random() * 0.04);
        const s3 = total - s1 - s2;
        const def = VEHICLE_CATALOG[this.state.vehicleId];

        el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title" style="color:${def.color}">⏱ VUELTA CLASIFICATORIA</div>
            <div class="qualy-vehicle-badge">${def.icon} ${def.name}</div>
            <div class="qualy-car-anim">${def.icon}</div>
            <div class="qualy-sectors">
                <div class="sector-box"><span class="sec-label">SECTOR 1</span><span class="sec-time" id="t1">· · ·</span></div>
                <div class="sector-box"><span class="sec-label">SECTOR 2</span><span class="sec-time" id="t2">· · ·</span></div>
                <div class="sector-box"><span class="sec-label">SECTOR 3</span><span class="sec-time" id="t3">· · ·</span></div>
            </div>
            <div class="qualy-total-wrap" id="qualyTotalWrap">
                <span class="qualy-label">TIEMPO TOTAL</span>
                <span class="qualy-total-time" id="qualyTotal">—:—.———</span>
            </div>
        </div>`;

        setTimeout(() => { const t = document.getElementById("t1"); if (t) { t.textContent = s1.toFixed(3) + "s"; t.classList.add("done"); } }, 1100);
        setTimeout(() => { const t = document.getElementById("t2"); if (t) { t.textContent = s2.toFixed(3) + "s"; t.classList.add("done"); } }, 2400);
        setTimeout(() => { const t = document.getElementById("t3"); if (t) { t.textContent = s3.toFixed(3) + "s"; t.classList.add("done"); } }, 3700);
        setTimeout(() => {
            const t = document.getElementById("qualyTotal");
            if (t) { t.textContent = formatLapTime(total); t.classList.add("done"); }
            if (gotPole) {
                const w = document.getElementById("qualyTotalWrap");
                if (w) w.insertAdjacentHTML("beforeend", `<div class="pole-banner">🟣 POLE POSITION</div>`);
            }
            this.state.grid.sort((a, b) => a.qualyTime - b.qualyTime);
            setTimeout(() => this._showGrid(gotPole), 1400);
        }, 5000);
    },

    _showGrid(gotPole) {
        const s   = this.state;
        s.phase   = "grid";
        const el  = this.el();
        if (!el) return;
        const def = VEHICLE_CATALOG[s.vehicleId];

        const rows = s.grid.map((r, i) => `
        <div class="grid-row ${r.name === "Tú" ? "player-row" : ""}">
            <span class="grid-pos">${i + 1}</span>
            <span class="grid-name">${r.name}</span>
            <span class="grid-qtime">${formatLapTime(r.qualyTime)}</span>
        </div>`).join("");

        const seriesLabel = s.seriesMode > 1
            ? `<div class="race-divider">CARRERA ${s.seriesRace + 1} DE ${s.seriesMode}</div>` : "";

        el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title" style="color:${def.color}">🚦 PARRILLA DE SALIDA</div>
            <div class="qualy-vehicle-badge">${def.icon} ${def.name}</div>
            ${gotPole ? `<div class="pole-banner">🟣 POLE POSITION — MEJOR TIEMPO</div>` : ""}
            ${seriesLabel}
            <div class="grid-table">${rows}</div>
            <button class="rbtn accent-btn" onclick="RaceManager._beginRace()">🚥 ¡ARRANCAR!</button>
        </div>`;
    },

    // ── Race loop ────────────────────────────────────────────────

    _beginRace() {
        const s = this.state;
        s.phase         = "racing";
        s.lap           = 0;
        s.standings     = s.grid.map((r, i) => ({ ...r, pos: i + 1 }));
        s.prevStandings = s.standings.map(x => ({ ...x }));
        this._renderLap();
        s.raceInterval = setInterval(() => this._doLap(), 1300);
    },

    _doLap() {
        const s = this.state;
        s.lap++;
        if (s.lap > s.totalLaps) {
            clearInterval(s.raceInterval);
            this._endRace();
            return;
        }

        const pace     = getVehiclePace(s.vehicleId);
        s.prevStandings = s.standings.map(x => ({ ...x }));
        s.standings = s.standings.map(r => ({
            ...r,
            lapTime: r.name === "Tú"
                ? pace + (Math.random() - 0.5) * 3
                : r.basePace + (Math.random() - 0.5) * 4
        }));
        s.standings.sort((a, b) => a.lapTime - b.lapTime);
        s.standings = s.standings.map((r, i) => ({ ...r, pos: i + 1 }));
        this._renderLap();
    },

    _renderLap() {
        const s   = this.state;
        const el  = this.el();
        if (!el) return;
        const def = VEHICLE_CATALOG[s.vehicleId];

        const pct  = Math.round((s.lap / s.totalLaps) * 100);
        const info = s.seriesMode > 1
            ? `${def.icon} Carrera ${s.seriesRace + 1}/${s.seriesMode}`
            : `${def.icon} Carrera rápida`;

        const lapLabel = def.lapLabel || "Vuelta";

        const rows = s.standings.map((r, i) => {
            const prevIdx = s.prevStandings.findIndex(x => x.name === r.name);
            const delta   = prevIdx - i;
            const arrow   = delta > 0 ? `<span class="pos-up">▲</span>`
                : delta < 0 ? `<span class="pos-dn">▼</span>`
                : `<span class="pos-eq">—</span>`;
            return `
            <div class="race-live-row ${r.name === "Tú" ? "player-row" : ""}">
                <span class="rlpos">${i + 1}</span>
                ${arrow}
                <span class="rlname">${r.name}</span>
            </div>`;
        }).join("");

        el.innerHTML = `
        <div class="race-card">
            <div class="race-live-header">
                <span class="race-live-title">${info}</span>
                <span class="lap-badge" style="background:${def.color}">${lapLabel} ${s.lap}/${s.totalLaps}</span>
            </div>
            <div class="lap-track"><div class="lap-track-fill" style="width:${pct}%;background:${def.color}"></div></div>
            <div class="live-standings">${rows}</div>
        </div>`;
    },

    // ── End of race ──────────────────────────────────────────────

    _endRace() {
        const s         = this.state;
        const playerIdx = s.standings.findIndex(r => r.name === "Tú");
        const pos       = playerIdx + 1;
        const vehicleId = s.vehicleId;

        // Economy rewards (balanced)
        const cashTable = [0, 1200, 700, 450, 300, 200, 130, 80, 50, 25, 10];
        const xpTable   = [0, 250,  170, 120, 90,  70,  50,  30, 15, 8,  4];
        const cash      = cashTable[pos] || 0;
        const xp        = xpTable[pos]   || 0;
        const lgPts     = PointsCalculator.forPosition(pos);

        s._pendingReward = { cash, xp, lgPts, pos };

        this._applyRaceResults(vehicleId, pos, cash, xp, lgPts);
    },

    // ── start_race() / calculate_race_results() ──────────────────

    _applyRaceResults(vehicleId, pos, cash, xp, lgPts) {
        const s = this.state;

        earn_coins(cash);
        addXP(xp);
        if (pos <= 3) game.reputation += (4 - pos);
        if (pos === 1)      game.medals.gold++;
        else if (pos === 2) game.medals.silver++;
        else if (pos === 3) game.medals.bronze++;

        // League points for all drivers
        LeagueManager.add_league_points(vehicleId, s.standings);

        // Series points
        const pts = PointsCalculator.POINTS;
        s.standings.forEach((r, i) => {
            s.seriesPoints[r.name] = (s.seriesPoints[r.name] || 0) + (pts[i] || 0);
        });

        // Race history
        game.raceResults.push({
            vehicleId,
            position:     pos,
            moneyEarned:  cash,
            xpEarned:     xp,
            leaguePoints: lgPts,
            timestamp:    Date.now()
        });
        if (game.raceResults.length > 50) game.raceResults.shift();

        s.seriesRace++;
        s.phase = "result";

        if (window.FTUEManager) FTUEManager.onRaceCompleted();

        this._showResult(pos, cash, xp);
    },

    _showResult(pos, cash, xp) {
        const s   = this.state;
        const el  = this.el();
        if (!el) return;
        const def = VEHICLE_CATALOG[s.vehicleId];

        const medal    = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : "🏁";
        const posLabel = pos === 1 ? "1er lugar" : pos === 2 ? "2do lugar" : pos === 3 ? "3er lugar" : `${pos}° lugar`;
        const pts      = PointsCalculator.POINTS;

        const rows = s.standings.map((r, i) => `
        <div class="result-row ${r.name === "Tú" ? "player-row" : ""}">
            <span class="res-medal">${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
            <span class="res-name">${r.name}</span>
            <span class="res-pts">${pts[i] || 0}pts</span>
        </div>`).join("");

        const hasMore = s.seriesRace < s.seriesMode;

        const adBtn = AdsManager.canOffer("double_race_reward")
            ? `<button class="rbtn ad-btn" onclick="AdsManager.offer_ad_double_race_reward()">📺 Ver anuncio — Doblar recompensa</button>`
            : "";

        el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title" style="color:${def.color}">${medal} ${posLabel}</div>
            <div class="qualy-vehicle-badge">${def.icon} ${def.name}</div>
            ${cash > 0 ? `<div class="result-reward-badge">+$${cash.toLocaleString()} &nbsp;·&nbsp; +${xp} XP</div>` : ""}
            <div class="result-standings">${rows}</div>
            ${adBtn}
            ${hasMore
                ? `<button class="rbtn accent-btn" onclick="RaceManager._beginRace()">Siguiente (${s.seriesRace + 1}/${s.seriesMode}) →</button>`
                : `<button class="rbtn accent-btn" onclick="RaceManager._showSeriesResult()">🏆 Resultado final</button>`}
            <button class="rbtn" onclick="RaceManager.backToMenu()">← Menú</button>
        </div>`;
    },

    _showSeriesResult() {
        const s      = this.state;
        const el     = this.el();
        if (!el) return;
        const def    = VEHICLE_CATALOG[s.vehicleId];
        const sorted = Object.entries(s.seriesPoints).sort((a, b) => b[1] - a[1]);
        const myPos  = sorted.findIndex(([n]) => n === "Tú") + 1;
        const trophy = myPos === 1 ? "🥇" : myPos === 2 ? "🥈" : myPos === 3 ? "🥉" : "🏁";

        const rows = sorted.map(([name, pts], i) => `
        <div class="result-row ${name === "Tú" ? "player-row" : ""}">
            <span class="res-medal">${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
            <span class="res-name">${name}</span>
            <span class="res-pts">${pts}pts</span>
        </div>`).join("");

        el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title" style="color:${def.color}">${trophy} CAMPEONATO FINAL</div>
            <div class="qualy-vehicle-badge">${def.icon} ${def.name}</div>
            <div class="result-standings">${rows}</div>
            <button class="rbtn" onclick="RaceManager.backToMenu()">${s.leagueMode ? "← Volver a Liga" : "← Menú"}</button>
        </div>`;
    },

    backToMenu() {
        const s = this.state;
        s.phase        = "menu";
        s.leagueMode   = false;
        s.renderTarget = "raceContent";
        renderRaceScreen();
    }
};

// ── Unified Paddock screen ────────────────────────────────────────
function renderRaceScreen() {
    const el = document.getElementById("raceContent");
    if (!el) return;
    if (RaceManager.state.phase !== "menu") return;

    const vehicleId = game.activeVehicle;
    const def       = VEHICLE_CATALOG[vehicleId];
    const lg        = game.leagues[vehicleId] || { currentRace: 1, standings: [] };

    // ── Vehicle tab bar ───────────────────────────────────────────
    const tabsHtml = Object.values(VEHICLE_CATALOG).map(v => {
        const owned  = game.vehicles[v.id]?.owned;
        const active = v.id === vehicleId;
        const shortName = { car: "Auto", moto: "Moto", rally: "Rally", formula: "F1" }[v.id];
        return `
        <button class="pdk-vtab ${active ? "pdk-vtab-active" : ""} ${!owned ? "pdk-vtab-locked" : ""}"
                onclick="${owned ? `setRaceVehicle('${v.id}')` : ""}"
                style="${active ? `border-bottom-color:${v.color};color:${v.color}` : ""}">
            <span class="pdk-vtab-icon">${v.icon}</span>
            <span class="pdk-vtab-label">${shortName}</span>
            ${!owned ? `<span class="pdk-lock-badge">Nv.${v.unlockLevel}</span>` : ""}
        </button>`;
    }).join("");

    // ── Season calculations ───────────────────────────────────────
    const racesDone      = Math.max(0, (lg.currentRace || 1) - 1);
    const seasonNum      = Math.floor(racesDone / 10) + 1;
    const doneInSeason   = racesDone % 10;
    const circuitIdx     = racesDone % 10;
    const circuit        = RACE_CIRCUITS[vehicleId][circuitIdx];
    const raceInSeason   = doneInSeason + 1;

    const dots = Array.from({ length: 10 }, (_, i) => {
        const done    = i < doneInSeason;
        const current = i === doneInSeason;
        const isFinal = i === 9;
        return `<div class="sdot ${done ? "sdot-done" : ""} ${current ? "sdot-next" : ""} ${isFinal ? "sdot-final" : ""}"
                     style="${(done || current) ? `background:${def.color};border-color:${def.color}` : ""}">
            ${done ? "✓" : current ? `<span style="color:#fff;font-size:8px">▶</span>` : isFinal ? "🏆" : ""}
        </div>`;
    }).join("");

    // ── Stats ─────────────────────────────────────────────────────
    const rank    = LeagueManager.getPlayerRank(vehicleId);
    const pts     = LeagueManager.getPlayerPoints(vehicleId);
    const pace    = getVehiclePace(vehicleId);
    const rivals  = VEHICLE_RIVALS[vehicleId] || [];
    const fastest = rivals.reduce((a, b) => a.basePace < b.basePace ? a : b, rivals[0] || { basePace: 99, name: "—" });
    const gap     = (pace - fastest.basePace).toFixed(1);
    const warn    = gap > 8;
    const best    = game.bestLapTimes[vehicleId];
    const diffStars = "●".repeat(circuit.diff) + "○".repeat(5 - circuit.diff);

    // ── Standings top-5 ───────────────────────────────────────────
    const allStandings  = LeagueManager.getStandings(vehicleId);
    const top5          = allStandings.slice(0, 5);
    const standingsHtml = top5.length === 0
        ? `<div class="empty-row">Sin carreras disputadas todavía</div>`
        : top5.map((t, i) => {
            const isPlayer = t.name === "Jugador";
            const posIcon  = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
            return `<div class="pdkst-row ${isPlayer ? "pdkst-player" : ""}">
                <span class="pdkst-pos">${posIcon}</span>
                <span class="pdkst-name">${isPlayer ? (game.playerName || "Tú") : t.name}</span>
                <span class="pdkst-pts" style="${isPlayer ? `color:${def.color}` : ""}">${t.points}</span>
            </div>`;
        }).join("");

    // ── All-leagues mini-grid ─────────────────────────────────────
    const allLgHtml = Object.values(VEHICLE_CATALOG).map(v => {
        const owned   = game.vehicles[v.id]?.owned;
        const isActive = v.id === vehicleId;
        if (!owned) {
            return `<div class="pdklg-card pdklg-locked">
                <div class="pdklg-vehicle-icon">${v.icon}</div>
                <div class="pdklg-vname">${{ car:"Auto", moto:"Moto", rally:"Rally", formula:"F1" }[v.id]}</div>
                <div class="pdklg-lock">🔒 Nv.${v.unlockLevel}</div>
            </div>`;
        }
        const vRank = LeagueManager.getPlayerRank(v.id);
        const vPts  = LeagueManager.getPlayerPoints(v.id);
        const vDone = Math.max(0, (game.leagues[v.id]?.currentRace || 1) - 1) % 10;
        return `<div class="pdklg-card ${isActive ? "pdklg-active" : ""}"
                     onclick="setRaceVehicle('${v.id}')"
                     style="border-color:${isActive ? v.color : "var(--border)"}">
            <div class="pdklg-top">
                <span class="pdklg-vehicle-icon">${v.icon}</span>
                <span class="pdklg-rank" style="color:${v.color}">${vRank}°</span>
            </div>
            <div class="pdklg-vname">${{ car:"Auto", moto:"Moto", rally:"Rally", formula:"F1" }[v.id]}</div>
            <div class="pdklg-pts">${vPts} pts</div>
            <div class="pdklg-mini-bar"><div class="pdklg-mini-fill" style="width:${vDone * 10}%;background:${v.color}"></div></div>
            <div class="pdklg-progress">${vDone}/10</div>
        </div>`;
    }).join("");

    // ── Recent results for selected vehicle ───────────────────────
    const recentResults = game.raceResults.filter(r => r.vehicleId === vehicleId).slice(-3).reverse();
    const histHtml = recentResults.map(r => {
        const medal = r.position === 1 ? "🥇" : r.position === 2 ? "🥈" : r.position === 3 ? "🥉" : `${r.position}°`;
        return `<div class="pdk-hist-row">
            <span>${medal}</span>
            <span class="pdk-hist-reward">+$${r.moneyEarned.toLocaleString()}</span>
            <span class="pdk-hist-pts" style="color:${def.color}">+${r.leaguePoints}pts</span>
        </div>`;
    }).join("");

    // ── Render ────────────────────────────────────────────────────
    el.innerHTML = `
    <div class="pdk-vtabs">${tabsHtml}</div>

    <!-- Season timeline -->
    <div class="pdk-card pdk-season-card" style="border-top:3px solid ${def.color}">
        <div class="pdk-season-header">
            <div>
                <div class="pdk-eyebrow">TEMPORADA ${seasonNum}</div>
                <div class="pdk-season-title" style="color:${def.color}">${def.icon} Liga ${def.name}</div>
            </div>
            <div class="pdk-season-badge" style="background:${def.color}">T${seasonNum}</div>
        </div>
        <div class="sdots-row">${dots}</div>
        <div class="pdk-season-stats">
            <div class="pdk-sstat">
                <div class="pdk-sstat-val" style="color:${def.color}">${rank}°</div>
                <div class="pdk-sstat-lbl">Posición</div>
            </div>
            <div class="pdk-sstat">
                <div class="pdk-sstat-val">${pts}</div>
                <div class="pdk-sstat-lbl">Puntos</div>
            </div>
            <div class="pdk-sstat">
                <div class="pdk-sstat-val">${doneInSeason}<span style="font-size:12px;color:var(--text-muted)">/10</span></div>
                <div class="pdk-sstat-lbl">Carreras</div>
            </div>
            <div class="pdk-sstat">
                <div class="pdk-sstat-val">${best ? formatLapTime(best) : "—"}</div>
                <div class="pdk-sstat-lbl">Mejor vuelta</div>
            </div>
        </div>
    </div>

    <!-- Next race -->
    <div class="pdk-card pdk-next-card" style="border-left:4px solid ${def.color}">
        <div class="pdk-nr-label">🚦 PRÓXIMA CARRERA — Ronda ${raceInSeason}/10</div>
        <div class="pdk-nr-header">
            <div class="pdk-nr-info">
                <div class="pdk-nr-circuit">${circuit.flag} ${circuit.name}</div>
                <div class="pdk-nr-meta">
                    <span class="pdk-diff-stars" style="color:${def.color}">${diffStars}</span>
                    <span class="pdk-diff-label">${DIFF_LABELS[circuit.diff]}</span>
                    <span class="pdk-weather">${circuit.weather}</span>
                </div>
            </div>
        </div>
        <div class="pdk-pace-row">
            <div class="pdk-pace-box">
                <div class="pdk-pace-val">${pace.toFixed(1)}s</div>
                <div class="pdk-pace-lbl">Tu ritmo</div>
            </div>
            <div class="pdk-vs">VS</div>
            <div class="pdk-pace-box pdk-rival-box">
                <div class="pdk-pace-val rival-clr">${fastest.basePace}s</div>
                <div class="pdk-pace-lbl">${fastest.name}</div>
            </div>
            <div class="pdk-gap-box ${warn ? "gap-warn" : "gap-ok"}">
                <div class="pdk-gap-val">${gap > 0 ? "+" : ""}${gap}s</div>
                <div class="pdk-gap-lbl">Gap</div>
            </div>
        </div>
        ${warn ? `<div class="pdk-warn-bar">⚠️ Mejora tu vehículo para cerrar el gap con los rivales</div>` : ""}
        <button class="rbtn pdk-race-btn" style="background:${def.color};border-color:${def.color}"
                onclick="RaceManager.startLeague('${vehicleId}', 1)">
            🚦 CLASIFICAR — ${circuit.name}
        </button>
        ${histHtml ? `<div class="pdk-hist-row-wrap">${histHtml}</div>` : ""}
    </div>

    <!-- Quick TT -->
    <div class="pdk-card pdk-tt-card">
        <div class="pdk-tt-inner">
            <div class="pdk-tt-left">
                <div class="pdk-tt-title">⏱ VUELTA RÁPIDA</div>
                <div class="pdk-tt-sub">Práctica libre · Sin puntos de liga</div>
            </div>
            <button class="rbtn pdk-tt-btn" onclick="RaceManager.start('${vehicleId}', 1)">⚡ Correr</button>
        </div>
    </div>

    <!-- Standings -->
    <div class="pdk-card">
        <div class="pdk-section-label">🏆 CLASIFICACIÓN — ${def.name}</div>
        <div class="pdk-standings">${standingsHtml}</div>
        ${allStandings.length > 5 ? `<div class="pdk-more-hint">Top 5 de ${allStandings.length} pilotos</div>` : ""}
    </div>

    <!-- All leagues -->
    <div class="pdk-card">
        <div class="pdk-section-label">⚡ TODAS LAS LIGAS</div>
        <div class="pdk-leagues-grid">${allLgHtml}</div>
    </div>
    `;
}

function setRaceVehicle(vehicleId) {
    if (!game.vehicles[vehicleId]?.owned) return;
    game.activeVehicle = vehicleId;
    renderRaceScreen();
}

function selectRaceVehicle(vehicleId) { setRaceVehicle(vehicleId); }
