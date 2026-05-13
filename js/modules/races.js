// ── Race Circuits (10 per vehicle type = one full season) ─────────
const RACE_CIRCUITS = {
    car: [
        { name: "Circuito de Madrid",     flag: "🇪🇸", diff: 1, weather: "☀️" },
        { name: "Oval de Nevada",          flag: "🇺🇸", diff: 1, weather: "🌤" },
        { name: "Curva del Diablo",        flag: "🇲🇽", diff: 2, weather: "⛅" },
        { name: "Circuit de Monaco",       flag: "🇲🇨", diff: 2, weather: "☀️" },
        { name: "Pista de Tokio",          flag: "🇯🇵", diff: 2, weather: "🌧" },
        { name: "Autódromo São Paulo",     flag: "🇧🇷", diff: 2, weather: "⛅" },
        { name: "Silverstone Circuit",     flag: "🇬🇧", diff: 3, weather: "🌥" },
        { name: "Circuito de Dubái",       flag: "🇦🇪", diff: 1, weather: "☀️" },
        { name: "Pista del Sahara",        flag: "🇲🇦", diff: 2, weather: "🌵" },
        { name: "Gran Final — Monza",      flag: "🇮🇹", diff: 3, weather: "☀️" },
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

// ── Tire compounds (only for formula) ─────────────────────────────
const TIRE_COMPOUNDS = {
    soft:   { id: 'soft',   label: 'Blando', icon: '🔴', paceBonus: -3.5, degradation: 0.072 },
    medium: { id: 'medium', label: 'Medio',  icon: '🟡', paceBonus:  0,   degradation: 0.042 },
    hard:   { id: 'hard',   label: 'Duro',   icon: '⚪', paceBonus:  4.0, degradation: 0.016 },
};

// ── Race format per vehicle ───────────────────────────────────────
// car: no tires (trackday style), moto: no tires, rally: stages, formula: tires + pit
const RACE_FORMAT = {
    car:     { laps: 20, interval: 800,  hasTires: false, hasPit: false, isRally: false, pitWindow: null },
    moto:    { laps: 20, interval: 800,  hasTires: false, hasPit: false, isRally: false, pitWindow: null },
    rally:   { laps: 10, interval: 1500, hasTires: false, hasPit: false, isRally: true,  pitWindow: null },
    formula: { laps: 30, interval: 700,  hasTires: true,  hasPit: true,  isRally: false, pitWindow: [10, 22] },
};

// ── Rally stage events ────────────────────────────────────────────
const RALLY_EVENTS = [
    { label: '❄️ Tramo nevado',      effect: +7 },
    { label: '🌧 Lluvia intensa',     effect: +5 },
    { label: '🏔 Subida empinada',    effect: +4 },
    { label: '🌵 Grava suelta',       effect: +4 },
    { label: '💨 Viento cruzado',     effect: +3 },
    { label: '🌲 Bosque estrecho',    effect: +5 },
    { label: '☀️ Buen asfalto',       effect: -3 },
    { label: '🛣 Tramo rápido',       effect: -5 },
    { label: '⚡ Ataque completo',    effect: -4 },
    { label: '🔥 Máximo ritmo',       effect: -6 },
];

// ── Race Manager ──────────────────────────────────────────────────
const RaceManager = {

    state: {
        phase:          "menu",
        vehicleId:      "car",
        seriesMode:     1,
        seriesRace:     0,
        seriesPoints:   {},
        grid:           [],
        standings:      [],
        prevStandings:  [],
        lap:            0,
        totalLaps:      20,
        raceInterval:   null,
        leagueMode:     false,
        renderTarget:   "raceContent",
        _pendingReward: null,
        tireCompound:   "medium",
        tireCondition:  1.0,
        pitDone:        false,
        pitStrategy:    "normal",
        _pitWindow:     null,
        _pitOpen:       false,
        stageEvent:     null,
        skipQualy:      false,
    },

    el() {
        return document.getElementById(this.state.renderTarget);
    },

    // ── Entry points ─────────────────────────────────────────────

    start(vehicleId) {
        const s = this.state;
        s.vehicleId    = vehicleId || game.activeVehicle;
        s.leagueMode   = false;
        s.seriesMode   = 1;
        s.renderTarget = "raceContent";
        this.showRaceConfig();
    },

    startLeague(vehicleId, n) {
        const s = this.state;
        s.vehicleId    = vehicleId;
        s.leagueMode   = true;
        s.seriesMode   = n || 1;
        s.renderTarget = "raceContent";
        game.activeVehicle = vehicleId;
        this.showRaceConfig();
    },

    // ── Pre-race config ───────────────────────────────────────────

    showRaceConfig() {
        const s      = this.state;
        const el     = this.el();
        if (!el) return;
        const def    = VEHICLE_CATALOG[s.vehicleId];
        const format = RACE_FORMAT[s.vehicleId];
        const circs  = RACE_CIRCUITS[s.vehicleId] || [];
        const lg     = game.leagues[s.vehicleId] || { currentRace: 1 };
        const done   = Math.max(0, (lg.currentRace || 1) - 1);
        const circ   = circs[done % circs.length] || circs[0] || {};
        s.phase      = "config";

        // Only show tire selection for formula
        const tiresHtml = format.hasTires ? (() => {
            const btns = Object.values(TIRE_COMPOUNDS).map(t => {
                const active    = s.tireCompound === t.id;
                const degLabel  = t.degradation >= 0.065 ? 'Alta deg.' : t.degradation >= 0.035 ? 'Media deg.' : 'Baja deg.';
                const paceLabel = t.paceBonus < 0 ? `+${Math.abs(t.paceBonus)}s` : t.paceBonus > 0 ? `-${t.paceBonus}s` : 'Base';
                return `<button class="cfg-tire-btn${active ? ' cfg-tire-active' : ''}"
                    style="${active ? `border-color:${def.color}` : ''}"
                    onclick="RaceManager.selectTire('${t.id}')">
                    <span class="cfg-tire-icon">${t.icon}</span>
                    <span class="cfg-tire-name">${t.label}</span>
                    <span class="cfg-tire-stat">${paceLabel}</span>
                    <span class="cfg-tire-deg">${degLabel}</span>
                </button>`;
            }).join('');
            return `<div class="cfg-section-label">NEUMÁTICOS</div><div class="cfg-tire-row">${btns}</div>`;
        })() : '';

        const pitHtml = format.hasPit ? (() => {
            const strats = [
                { id:'early',  icon:'🔴', label:'Temprano', range:'Vuelta 5–12' },
                { id:'normal', icon:'🟡', label:'Normal',   range:'Vuelta 13–18' },
                { id:'late',   icon:'🟢', label:'Tardío',   range:'Vuelta 19–25' },
            ];
            const btns = strats.map(st => `
            <button class="cfg-pit-btn${s.pitStrategy===st.id ? ' cfg-pit-active' : ''}"
                    onclick="RaceManager.selectPit('${st.id}')">
                ${st.icon} ${st.label}<br><small>${st.range}</small>
            </button>`).join('');
            return `<div class="cfg-section-label">ESTRATEGIA PIT STOP</div><div class="cfg-pit-row">${btns}</div>`;
        })() : '';

        const diff     = circ.diff || 1;
        const diffStr  = '●'.repeat(diff) + '○'.repeat(5 - diff);
        const lapWord  = format.isRally ? 'etapas' : 'vueltas';
        const extraTag = format.hasPit ? ' · PIT STOP OBLIGATORIO' : format.isRally ? ' · ETAPAS ESPECIALES' : '';

        // Trackday badge for car
        const trackdayBadge = s.vehicleId === 'car'
            ? `<div style="background:rgba(34,197,94,0.15);border:1px solid #22c55e44;border-radius:8px;padding:6px 10px;font-size:11px;color:#22c55e;margin-bottom:8px;text-align:center">🏁 Estilo Trackday — ¡Competencia amigable!</div>`
            : '';

        el.innerHTML = `
        <div class="race-card">
            <div class="cfg-vehicle-header">
                <span class="cfg-v-icon">${def.icon}</span>
                <div>
                    <div class="cfg-v-name" style="color:${def.color}">${def.name}</div>
                    <div class="cfg-v-format">${format.laps} ${lapWord}${extraTag}</div>
                </div>
            </div>
            ${trackdayBadge}
            <div class="cfg-circuit-box">
                <span class="cfg-circuit-flag">${circ.flag || '🏁'}</span>
                <div>
                    <div class="cfg-circuit-name">${circ.name || 'Circuito'}</div>
                    <div class="cfg-circuit-meta">${diffStr} · ${circ.weather || '☀️'} · ${DIFF_LABELS[diff] || ''}</div>
                </div>
            </div>
            ${tiresHtml}
            ${pitHtml}
            <button class="rbtn pdk-race-btn" style="background:${def.color}"
                    onclick="RaceManager._startFromConfig(false)">🚦 CLASIFICAR Y CORRER</button>
            <button class="rbtn" onclick="RaceManager._startFromConfig(true)">⚡ Correr directo (sin clasificatoria)</button>
            <button class="rbtn" style="opacity:0.55;font-size:12px" onclick="RaceManager.backToMenu()">← Cancelar</button>
        </div>`;
    },

    selectTire(id) {
        this.state.tireCompound = id;
        this.showRaceConfig();
    },

    selectPit(strategy) {
        this.state.pitStrategy = strategy;
        this.showRaceConfig();
    },

    _startFromConfig(skipQualy) {
        const s      = this.state;
        s.skipQualy  = skipQualy;
        s.seriesRace = 0;
        s.seriesPoints = {};
        const vid    = s.vehicleId;
        const format = RACE_FORMAT[vid];
        const rivals = VEHICLE_RIVALS[vid] || [];
        const pace   = getVehiclePace(vid);
        s.totalLaps  = format.laps;

        // Dynamic rivals: cluster around player pace for real competition
        // Offsets: 2 slightly faster, 3 close, 3 slower → target ~6/10 wins
        const offsets = [-1.0, -0.4, 0.2, 0.5, 0.8, 1.2, 2.5, 4.5];
        s.grid = rivals.map((r, idx) => {
            const offset    = offsets[idx % offsets.length];
            const rivalPace = pace + offset;
            return {
                name:      r.name,
                qualyTime: rivalPace + (Math.random() - 0.5) * 10,
                basePace:  rivalPace,
                totalTime: 0
            };
        });
        s.grid.push({ name: "Tú", qualyTime: pace + (Math.random() - 0.5) * 5, basePace: pace, totalTime: 0 });

        if (skipQualy) {
            s.grid.sort(() => Math.random() - 0.5);
            s.phase = "grid";
            if (window.FTUEManager) FTUEManager.onRaceStarted();
            this._showGrid(false);
        } else {
            this._startQualy(s.seriesMode || 1);
        }
    },

    doPitStop() {
        const s = this.state;
        if (s.pitDone || !s._pitOpen) return;
        s.pitDone  = true;
        s._pitOpen = false;
        s.tireCondition = 1.0;
        const pidx = s.standings.findIndex(r => r.name === "Tú");
        if (pidx >= 0 && pidx < s.standings.length - 2) {
            const [player] = s.standings.splice(pidx, 1);
            s.standings.splice(Math.min(pidx + 2, s.standings.length), 0, player);
            s.standings = s.standings.map((r, i) => ({ ...r, pos: i + 1 }));
        }
        notifySuccess('🔧 Pit stop: neumáticos nuevos');
        this._renderLap();
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

        // Player gets a fair qualifying time (based on pace)
        const playerTime = Math.max(def.basePace * 0.4, pace + (Math.random() - 0.5) * 3);

        s.totalLaps = RACE_FORMAT[vehicleId].laps;
        // Dynamic rivals: cluster around player pace for real competition
        const offsets = [-1.0, -0.4, 0.2, 0.5, 0.8, 1.2, 2.5, 4.5];
        s.grid = rivals.map((r, idx) => {
            const offset    = offsets[idx % offsets.length];
            const rivalPace = pace + offset;
            return {
                name:      r.name,
                qualyTime: rivalPace + (Math.random() - 0.5) * 10,
                basePace:  rivalPace,
                totalTime: 0
            };
        });
        s.grid.push({ name: "Tú", qualyTime: playerTime, basePace: pace, totalTime: 0 });

        const rivalBest = Math.min(...s.grid.filter(r => r.name !== "Tú").map(r => r.qualyTime));
        const gotPole   = playerTime < rivalBest;
        if (gotPole) {
            game.poleCount++;
            if (!game.stats) game.stats = {};
            game.stats.totalPoles = (game.stats.totalPoles || 0) + 1;
            if (window.TaskManager) { TaskManager.trackDaily('pole'); TaskManager._updateBadge(); }
        }

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

        // Tata Wolf tip when player didn't get pole
        if (!gotPole) {
            const tips = [
                "⚙️ Tata Wolf: Con el motor mejorado podríamos haber sacado la pole.",
                "💨 Tata Wolf: El turbo te daría las décimas que nos faltaron en clasificación.",
                "🔩 Tata Wolf: Una mejor suspensión da más agarre en las curvas rápidas.",
                "🛞 Tata Wolf: Neumáticos nuevos mejorarían el grip en la vuelta clasificatoria.",
                "🛑 Tata Wolf: Frenando más tarde con mejores frenos podríamos haber sido pole."
            ];
            const tip = tips[Math.floor(Math.random() * tips.length)];
            setTimeout(() => notifyInfo(tip), 800);
        }
    },

    // ── Race loop ────────────────────────────────────────────────

    _beginRace() {
        const s      = this.state;
        s.phase      = "racing";
        s.lap        = 0;
        // Initialize cumulative times from qualifying order
        s.standings     = s.grid.map((r, i) => ({ ...r, pos: i + 1, totalTime: r.qualyTime || 0 }));
        s.prevStandings = s.standings.map(x => ({ ...x }));
        s.tireCondition = 1.0;
        s.pitDone       = false;
        s._pitOpen      = false;
        s.stageEvent    = null;
        const format = RACE_FORMAT[s.vehicleId];
        if (format.hasPit) {
            const windows = { early:[5,12], normal:[13,18], late:[19,25] };
            s._pitWindow = windows[s.pitStrategy] || windows.normal;
        } else {
            s._pitWindow = null;
        }
        this._renderLap();
        s.raceInterval = setInterval(() => this._doLap(), format.interval);
    },

    _doLap() {
        const s      = this.state;
        const format = RACE_FORMAT[s.vehicleId];
        const tire   = TIRE_COMPOUNDS[s.tireCompound] || TIRE_COMPOUNDS.medium;
        s.lap++;

        if (s.lap > s.totalLaps) {
            clearInterval(s.raceInterval);
            this._endRace();
            return;
        }

        // Tire degradation (formula only)
        if (format.hasTires) {
            s.tireCondition = Math.max(0.15, s.tireCondition - tire.degradation);
        }

        // Formula pit window management
        if (format.hasPit && s._pitWindow) {
            if (s.lap >= s._pitWindow[0] && !s.pitDone) s._pitOpen = true;
            if (s.lap > s._pitWindow[1] && !s.pitDone) {
                s.pitDone      = true;
                s._pitOpen     = false;
                s.tireCondition = 1.0;
                notifyWarn('⚠️ Pit stop automático — ventana cerrada');
                const pidx = s.standings.findIndex(r => r.name === "Tú");
                if (pidx >= 0 && pidx < s.standings.length - 3) {
                    const [player] = s.standings.splice(pidx, 1);
                    s.standings.splice(Math.min(pidx + 3, s.standings.length), 0, player);
                    s.standings = s.standings.map((r, i) => ({ ...r, pos: i + 1 }));
                }
            }
        }

        const pace         = getVehiclePace(s.vehicleId);
        const tireBonus    = format.hasTires ? tire.paceBonus : 0;
        const degradePenalty = format.hasTires ? (1 - s.tireCondition) * 18 : 0;
        const playerLapTime = pace + tireBonus + degradePenalty + (Math.random() - 0.5) * 2;

        s.prevStandings = s.standings.map(x => ({ ...x }));

        // ── KEY FIX: use CUMULATIVE total time, not per-lap sort ───
        if (format.isRally) {
            s.stageEvent = RALLY_EVENTS[Math.floor(Math.random() * RALLY_EVENTS.length)];
            const ev = s.stageEvent;
            s.standings = s.standings.map(r => {
                let lapTime = r.name === "Tú"
                    ? playerLapTime + ev.effect * (0.9 + Math.random() * 0.2)
                    : r.basePace + ev.effect * (0.8 + Math.random() * 0.4) + (Math.random() - 0.5) * 20;
                // Random incident: 5% chance (+25s penalty)
                if (r.name !== "Tú" && Math.random() < 0.05) lapTime += 25;
                return { ...r, lapTime, totalTime: (r.totalTime || 0) + lapTime };
            });
        } else {
            s.standings = s.standings.map(r => {
                let lapTime = r.name === "Tú"
                    ? playerLapTime
                    : r.basePace + (Math.random() - 0.5) * 20;
                // Random incident: 5% chance (+25s penalty) — creates upsets
                if (r.name !== "Tú" && Math.random() < 0.05) lapTime += 25;
                return { ...r, lapTime, totalTime: (r.totalTime || 0) + lapTime };
            });
        }

        // Sort by cumulative race time (lower = faster = ahead)
        s.standings.sort((a, b) => a.totalTime - b.totalTime);
        s.standings = s.standings.map((r, i) => ({ ...r, pos: i + 1 }));
        this._renderLap();
    },

    _renderLap() {
        const s      = this.state;
        const el     = this.el();
        if (!el) return;
        const def    = VEHICLE_CATALOG[s.vehicleId];
        const format = RACE_FORMAT[s.vehicleId];

        const pct      = Math.round((s.lap / s.totalLaps) * 100);
        const lapLabel = format.isRally ? 'Etapa' : (def.lapLabel || 'Vuelta');
        const info     = s.seriesMode > 1
            ? `${def.icon} Carrera ${s.seriesRace + 1}/${s.seriesMode}`
            : `${def.icon} ${format.isRally ? 'Rally' : 'Carrera rápida'}`;

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

        // Tire condition bar (formula only)
        const tireHtml = format.hasTires ? (() => {
            const tire = TIRE_COMPOUNDS[s.tireCompound] || TIRE_COMPOUNDS.medium;
            const tp   = Math.round(s.tireCondition * 100);
            const clr  = tp > 50 ? 'var(--green)' : tp > 25 ? 'var(--orange)' : 'var(--red)';
            return `<div class="live-tire-row">
                <span class="lt-icon">${tire.icon}</span>
                <div class="lt-bar-wrap"><div class="lt-bar" style="width:${tp}%;background:${clr}"></div></div>
                <span class="lt-pct" style="color:${clr}">${tp}%</span>
            </div>`;
        })() : '';

        // Formula pit stop button
        const pitHtml = format.hasPit
            ? (s._pitOpen && !s.pitDone
                ? `<button class="rbtn pit-stop-btn" onclick="RaceManager.doPitStop()">🔧 PIT STOP — neumáticos nuevos</button>`
                : (!s.pitDone && s._pitWindow && s.lap < s._pitWindow[0])
                    ? `<div class="pit-reminder">🔧 Ventana de pit en vuelta ${s._pitWindow[0]}</div>`
                    : s.pitDone ? `<div class="pit-done-tag">✅ Pit completado</div>` : '')
            : '';

        // Rally event badge
        const rallyHtml = (format.isRally && s.stageEvent)
            ? `<div class="rally-event-badge">${s.stageEvent.label} <span style="color:${s.stageEvent.effect > 0 ? 'var(--orange)' : 'var(--green)'}">${s.stageEvent.effect > 0 ? '+' : ''}${s.stageEvent.effect}s</span></div>`
            : '';

        el.innerHTML = `
        <div class="race-card">
            <div class="race-live-header">
                <span class="race-live-title">${info}</span>
                <span class="lap-badge" style="background:${def.color}">${lapLabel} ${s.lap}/${s.totalLaps}</span>
            </div>
            <div class="lap-track"><div class="lap-track-fill" style="width:${pct}%;background:${def.color}"></div></div>
            ${rallyHtml}
            ${tireHtml}
            <div class="live-standings">${rows}</div>
            ${pitHtml}
        </div>`;
    },

    // ── End of race ──────────────────────────────────────────────

    _endRace() {
        const s         = this.state;
        const playerIdx = s.standings.findIndex(r => r.name === "Tú");
        const pos       = playerIdx + 1;
        const vehicleId = s.vehicleId;

        // Improved economy rewards
        const cashTable = [0, 4500, 2800, 1800, 1200, 800, 500, 300, 180, 90, 40];
        const xpTable   = [0, 500,  350,  250,  180,  130, 90,  55,  30,  15, 6];
        const cash      = cashTable[pos] || 0;
        const xp        = xpTable[pos]   || 0;
        const lgPts     = PointsCalculator.forPosition(pos);

        s._pendingReward = { cash, xp, lgPts, pos };

        this._applyRaceResults(vehicleId, pos, cash, xp, lgPts);
    },

    // ── _applyRaceResults() ──────────────────────────────────────

    _applyRaceResults(vehicleId, pos, cash, xp, lgPts) {
        const s = this.state;

        earn_coins(cash);
        addXP(xp);
        if (pos <= 3) game.reputation += (4 - pos);
        if (pos === 1)      game.medals.gold++;
        else if (pos === 2) game.medals.silver++;
        else if (pos === 3) game.medals.bronze++;

        // Stats & task tracking
        if (!game.stats) game.stats = {};
        game.stats.totalRacesRun = (game.stats.totalRacesRun || 0) + 1;
        if (pos === 1) {
            game.stats.totalWins = (game.stats.totalWins || 0) + 1;
            // Track wins by vehicle type
            const wKey = 'wins_' + vehicleId;
            game.stats[wKey] = (game.stats[wKey] || 0) + 1;
            if (window.TaskManager) TaskManager.trackDaily('win');
        }
        game.stats.totalRaceCoins = (game.stats.totalRaceCoins || 0) + cash;
        if (window.TaskManager) {
            TaskManager.trackDaily('race');
            TaskManager.trackDaily('raceCoins', cash);
            TaskManager._updateBadge();
        }

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

        const adBtn = `<button class="rbtn ad-btn" onclick="AdsManager.offer_ad_double_race_reward()">📺 Ver anuncio — Doblar recompensa</button>`;

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
            <div class="race-divider">CLASIFICACIÓN FINAL</div>
            <div class="result-standings">${rows}</div>
            <button class="rbtn accent-btn" onclick="RaceManager.backToMenu()">✅ Listo</button>
        </div>`;
    },

    backToMenu() {
        const s = this.state;
        if (s.raceInterval) { clearInterval(s.raceInterval); s.raceInterval = null; }
        s.phase = "menu";
        if (typeof renderRaceScreen === "function") renderRaceScreen();
        else showScreen("dashboard");
    }
};

// ── renderRaceScreen ─────────────────────────────────────────────
function renderRaceScreen() {
    const el = document.getElementById("raceContent");
    if (!el) return;

    const s = RaceManager.state;
    if (s.phase !== "menu" && s.phase !== "config") return;

    const ownedVehicles = Object.entries(VEHICLE_CATALOG).filter(([id]) => game.vehicles[id]?.owned);

    const cards = ownedVehicles.map(([id, def]) => {
        const stats = getVehicleStats(id);
        const pace  = getVehiclePace(id);
        return `
        <div class="race-vehicle-card" onclick="RaceManager.start('${id}')"
             style="border-top-color:${def.color}">
            <div class="rvc-header">
                <span class="rvc-icon">${def.icon}</span>
                <div>
                    <div class="rvc-name" style="color:${def.color}">${def.name}</div>
                    <div class="rvc-desc">${def.desc}</div>
                </div>
            </div>
            <div class="rvc-stats">
                <div class="rvc-stat"><span>${stats ? stats.hp : '—'} HP</span><small>potencia</small></div>
                <div class="rvc-stat"><span>${pace.toFixed(1)}s</span><small>tiempo/vuelta</small></div>
            </div>
            <button class="rbtn" style="background:${def.color};margin-top:4px">Correr →</button>
        </div>`;
    }).join("");

    const lockedVehicles = Object.entries(VEHICLE_CATALOG)
        .filter(([id]) => !game.vehicles[id]?.owned)
        .map(([id, def]) => `
        <div class="race-vehicle-card rvc-locked">
            <div class="rvc-header">
                <span class="rvc-icon" style="opacity:0.3">🔒</span>
                <div>
                    <div class="rvc-name" style="color:${def.color};opacity:0.5">${def.name}</div>
                    <div class="rvc-desc">Se desbloquea en nivel ${def.unlockLevel}</div>
                </div>
            </div>
        </div>`).join("");

    el.innerHTML = `
    <div class="race-card">
        <div class="race-hero-title">🏁 SELECCIONÁ TU VEHÍCULO</div>
        ${cards}
        ${lockedVehicles}
        <button class="rbtn" onclick="showScreen('league')">🏆 Ver liga y campeonatos</button>
    </div>`;
}

window.RaceManager  = RaceManager;
window.renderRaceScreen = renderRaceScreen;
