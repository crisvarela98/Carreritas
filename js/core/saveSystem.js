const SAVE_KEY = "mgt_save_v1";

// ===== GUARDAR =====
function saveGame() {
    try {
        const data = {
            version: 1,
            timestamp: Date.now(),
            game: game
        };

        localStorage.setItem(SAVE_KEY, JSON.stringify(data));

    } catch (e) {
        console.error("Error al guardar:", e);
    }
}

// ===== CARGAR =====
function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);

        if (!raw) return;

        const data = JSON.parse(raw);

        // compatibilidad futura (versionado)
        if (data.version === 1) {
            Object.assign(game, data.game);
        }

    } catch (e) {
        console.error("Error al cargar:", e);
    }
}

// ===== RESET =====
function resetGame() {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
}

// ===== AUTO SAVE =====
function startAutoSave() {
    setInterval(() => {
        game.lastTime = Date.now();
        saveGame();
    }, 5000);
}