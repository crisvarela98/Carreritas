const SAVE_KEY = "mgt_save_v3";

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
    try {
        const data = {
            version: 3,
            timestamp: Date.now(),
            game: game
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Error al guardar:", e);
    }
}

// Alias
const saveGame = save_user_progress;

// ── Load ──────────────────────────────────────────────────────────
function load_user_progress() {
    try {
        // Try current save key first
        let raw = localStorage.getItem(SAVE_KEY);

        // Migrate from old save keys
        if (!raw) {
            const oldKeys = ["mgt_save_v1", "mgt_save_v2", "mgt_save_v1"];
            for (const k of oldKeys) {
                raw = localStorage.getItem(k);
                if (raw) {
                    localStorage.removeItem(k);
                    break;
                }
            }
        }

        if (!raw) return;

        const data = JSON.parse(raw);

        if (data.version >= 1 && data.game) {
            deepMerge(game, data.game);
        }

        // ── Ensure all required structures exist ──

        if (!game.workshop || !Array.isArray(game.workshop.active)) {
            game.workshop = { level: 1, speed: 1, capacity: 2, queue: [], active: [] };
        }
        if (!Array.isArray(game.employees))        game.employees = [];
        if (!Array.isArray(game.sponsorsUnlocked)) game.sponsorsUnlocked = [];
        if (!Array.isArray(game.mechanics))         game.mechanics = [];
        if (!Array.isArray(game.raceResults))       game.raceResults = [];

        if (!game.garageUpgrades) {
            game.garageUpgrades = { extraBay: 0, speedBoost: 0, partsStock: 0 };
        }

        // ── League migration: old saves stored league separately ──
        if (!game.league || !Array.isArray(game.league.standings)) {
            game.league = { currentRace: 1, totalRaces: 10, standings: [] };
        }

        if (!game.ftue) {
            game.ftue = { completed: false, step: 0 };
        }

        if (!game.medals) {
            game.medals = { gold: 0, silver: 0, bronze: 0 };
        }

    } catch (e) {
        console.error("Error al cargar:", e);
        localStorage.removeItem(SAVE_KEY);
    }
}

// Alias
const loadGame = load_user_progress;

function resetGame() {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
}

function startAutoSave() {
    setInterval(() => {
        game.lastTime = Date.now();
        save_user_progress();
    }, 5000);
}
