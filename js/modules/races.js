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

    // Called from League screen
    startLeague(vehicleId, n) {
        this.state.vehicleId   = vehicleId;
        this.state.leagueMode  = true;
        this.state.renderTarget = "leagueContent";
        this._startQualy(n);
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
        s.phase = "menu";
        if (s.leagueMode) {
            s.leagueMode   = false;
            s.renderTarget = "raceContent";
            renderLeague();
        } else {
            renderRaceScreen();
        }
    }
};

// ── Race screen render ─────────────────────────────────────────────
function renderRaceScreen() {
    const el = document.getElementById("raceContent");
    if (!el) return;
    if (RaceManager.state.phase !== "menu") return;

    const ownedVehicles = Object.entries(VEHICLE_CATALOG).filter(([id]) => game.vehicles[id]?.owned);

    const vehicleCards = ownedVehicles.map(([id, def]) => {
        const pace = getVehiclePace(id).toFixed(2);
        const best = game.bestLapTimes[id] ? formatLapTime(game.bestLapTimes[id]) : "—";
        const isActive = game.activeVehicle === id;

        return `
        <div class="race-vehicle-card ${isActive ? "rvc-active" : ""}" style="border-left:4px solid ${def.color}"
             onclick="selectRaceVehicle('${id}')">
            <div class="rvc-header">
                <span class="rvc-icon">${def.icon}</span>
                <div class="rvc-info">
                    <div class="rvc-name" style="color:${def.color}">${def.name}</div>
                    <div class="rvc-stats">Ritmo: ${pace}s · Mejor: ${best}</div>
                </div>
                ${isActive ? `<span class="rvc-selected-badge">✓</span>` : ""}
            </div>
        </div>`;
    }).join("");

    const lockedCards = Object.entries(VEHICLE_CATALOG)
        .filter(([id]) => !game.vehicles[id]?.owned)
        .map(([id, def]) => `
        <div class="race-vehicle-card rvc-locked">
            <div class="rvc-header">
                <span class="rvc-icon">🔒</span>
                <div class="rvc-info">
                    <div class="rvc-name">${def.name}</div>
                    <div class="rvc-stats">Desbloquea en Nivel ${def.unlockLevel}</div>
                </div>
            </div>
        </div>`).join("");

    const active   = game.activeVehicle;
    const activeDef = VEHICLE_CATALOG[active];

    const histHtml = game.raceResults.filter(r => r.vehicleId === active).slice(-5).reverse()
        .map(r => {
            const d     = new Date(r.timestamp);
            const time  = d.toLocaleDateString("es", { month: "short", day: "numeric" });
            const medal = r.position === 1 ? "🥇" : r.position === 2 ? "🥈" : r.position === 3 ? "🥉" : `${r.position}°`;
            return `<div class="hist-row">
                <span class="hist-medal">${medal}</span>
                <span class="hist-reward">+$${r.moneyEarned.toLocaleString()}</span>
                <span class="hist-pts">+${r.leaguePoints}pts</span>
                <span class="hist-date">${time}</span>
            </div>`;
        }).join("");

    el.innerHTML = `
    <div class="race-card">
        <div class="race-hero-title">🏁 SELECCIONAR VEHÍCULO</div>
        ${vehicleCards}
        ${lockedCards}
    </div>

    <div class="race-card">
        <div class="race-hero-title" style="color:${activeDef.color}">${activeDef.icon} CARRERA RÁPIDA</div>
        <div class="race-stats-row">
            <div class="race-stat-box">
                <div class="rsb-label">Ritmo actual</div>
                <div class="rsb-value">${getVehiclePace(active).toFixed(2)}s</div>
            </div>
            <div class="race-stat-box">
                <div class="rsb-label">Mejor vuelta</div>
                <div class="rsb-value small">${game.bestLapTimes[active] ? formatLapTime(game.bestLapTimes[active]) : "—"}</div>
            </div>
            <div class="race-stat-box">
                <div class="rsb-label">Poles</div>
                <div class="rsb-value">${game.poleCount}</div>
            </div>
        </div>
        <button class="rbtn accent-btn" onclick="RaceManager.start('${active}', 1)">🚦 Iniciar clasificación</button>
    </div>

    ${histHtml ? `<div class="race-card"><div class="race-divider">ÚLTIMAS CARRERAS — ${activeDef.icon}</div>${histHtml}</div>` : ""}
    `;
}

function selectRaceVehicle(vehicleId) {
    game.activeVehicle = vehicleId;
    renderRaceScreen();
}
