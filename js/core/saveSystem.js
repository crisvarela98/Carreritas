const SAVE_KEY = "mgt_save_v5";
let _sessionTickStart = Date.now(); // tracks elapsed time since last save tick

function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
        if (
            source[key] !== null &&
            typeof source[key] === "object" &&
            !Array.isArray(source[key]) &&
            target[key] !== null &&
            typeof target[key] === "object" &&
            !Array.isArray(target[key])
        ) {
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
}

// ── Save ──────────────────────────────────────────────────────────
function save_user_progress() {
    // Accumulate elapsed seconds since last save tick
    const now = Date.now();
    const elapsedSec = Math.floor((now - _sessionTickStart) / 1000);
    if (elapsedSec > 0) {
        game.totalPlayTime = (game.totalPlayTime || 0) + elapsedSec;
    }
    _sessionTickStart = now;

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
            version: 4,
            timestamp: now,
            game
        }));
    } catch (e) {
        console.error("Save error:", e);
    }
    // Cloud save — fire & forget, graceful if offline
    if (window.CloudSave) CloudSave.save(game);
}
const saveGame = save_user_progress;

// ── Load with migration ───────────────────────────────────────────
function load_user_progress() {
    try {
        // Try current key, then migrate old saves
        let raw = localStorage.getItem(SAVE_KEY);
        if (!raw) {
            for (const k of ["mgt_save_v3", "mgt_save_v2", "mgt_save_v1"]) {
                raw = localStorage.getItem(k);
                if (raw) { localStorage.removeItem(k); break; }
            }
        }
        if (!raw) return;

        const data = JSON.parse(raw);
        if (data.game) deepMerge(game, data.game);

        // ── Ensure all required structures ─────────────────────────

        if (!game.workshop || !Array.isArray(game.workshop.active)) {
            game.workshop = { level: 1, speed: 1, capacity: 2, queue: [], active: [] };
        }
        if (!game.garageUpgrades) {
            game.garageUpgrades = { extraBay: 0, speedBoost: 0, partsStock: 0 };
        }
        if (!Array.isArray(game.mechanics))         game.mechanics = [];
        if (!Array.isArray(game.employees))          game.employees = [];
        if (!Array.isArray(game.sponsorsUnlocked))   game.sponsorsUnlocked = [];
        if (!Array.isArray(game.raceResults))         game.raceResults = [];
        if (!game.medals)       game.medals = { gold: 0, silver: 0, bronze: 0 };
        if (!game.bestLapTimes) game.bestLapTimes = {};
        if (typeof game.diamonds !== "number") game.diamonds = 0;

        // ── Vehicle migration (v3 → v4) ────────────────────────────
        if (!game.vehicles) {
            game.vehicles = {
                car:     { owned: true,  upgrades: { motor: 1, turbo: 0, brakes: 1, tires: 1, suspension: 1 } },
                moto:    { owned: false, upgrades: { motor: 1, turbo: 0, brakes: 1, tires: 1, suspension: 1 } },
                rally:   { owned: false, upgrades: { motor: 1, turbo: 0, brakes: 1, tires: 1, suspension: 1 } },
                formula: { owned: false, upgrades: { motor: 1, turbo: 0, brakes: 1, tires: 1, suspension: 1 } }
            };
        }
        for (const id of ["car", "moto", "rally", "formula"]) {
            if (!game.vehicles[id]) {
                game.vehicles[id] = { owned: id === "car", upgrades: { motor: 1, turbo: 0, brakes: 1, tires: 1, suspension: 1 } };
            }
        }

        // ── League migration (v3 had flat game.league, now per-vehicle) ─
        if (!game.leagues || !game.leagues.car) {
            // Migrate old flat league if present
            const oldPts = game.league && Array.isArray(game.league.standings)
                ? (game.league.standings.find(s => s.name === "Jugador") || {}).points || 0
                : 0;
            game.leagues = {
                car:     { standings: [], currentRace: 1 },
                moto:    { standings: [], currentRace: 1 },
                rally:   { standings: [], currentRace: 1 },
                formula: { standings: [], currentRace: 1 }
            };
            // Inject old car points if any
            if (oldPts > 0) {
                game.leagues.car.standings = [{ name: "Jugador", points: oldPts }];
            }
        }

        if (!game.ftue) game.ftue = { completed: false, step: 0 };
        if (!game.iap)  game.iap  = {};
        if (!game.activeVehicle) game.activeVehicle = "car";
        if (typeof game.totalPlayTime !== 'number') game.totalPlayTime = 0;

    } catch (e) {
        console.error("Load error:", e);
        localStorage.removeItem(SAVE_KEY);
    }
}
const loadGame = load_user_progress;

function resetGame() {
    if (!confirm("¿Reiniciar todo el progreso? Esta acción no se puede deshacer.")) return;
    localStorage.removeItem(SAVE_KEY);
    location.reload();
}

function startAutoSave() {
    setInterval(() => {
        game.lastTime = Date.now();
        save_user_progress();
    }, 30000);
}
