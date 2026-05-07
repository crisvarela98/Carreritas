const SAVE_KEY = "mgt_save_v1";

function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
        if (
            source[key] !== null &&
            typeof source[key] === 'object' &&
            !Array.isArray(source[key]) &&
            target[key] !== null &&
            typeof target[key] === 'object' &&
            !Array.isArray(target[key])
        ) {
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
}

function saveGame() {
    try {
        const data = {
            version: 2,
            timestamp: Date.now(),
            game: game
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Error al guardar:", e);
    }
}

function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;

        const data = JSON.parse(raw);

        if (data.version === 1 || data.version === 2) {
            deepMerge(game, data.game);

            if (!game.workshop || !Array.isArray(game.workshop.active)) {
                game.workshop = {
                    level: 1,
                    speed: 1,
                    capacity: 2,
                    queue: [],
                    active: []
                };
            }
            if (!Array.isArray(game.employees)) {
                game.employees = [];
            }
            if (!Array.isArray(game.sponsorsUnlocked)) {
                game.sponsorsUnlocked = [];
            }
        }
    } catch (e) {
        console.error("Error al cargar:", e);
        localStorage.removeItem(SAVE_KEY);
    }
}

function resetGame() {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
}

function startAutoSave() {
    setInterval(() => {
        game.lastTime = Date.now();
        saveGame();
    }, 5000);
}
