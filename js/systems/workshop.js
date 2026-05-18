function generateCar() {
    const rare = Math.random() < 0.2;
    return {
        id: Date.now() + Math.random(),
        duration: 10 + Math.random() * 10,
        progress: 0,
        reward: rare ? 500 : 150,
        rare
    };
}

function ensureWorkshopState() {
    if (!game.workshop || typeof game.workshop !== 'object') {
        game.workshop = { level: 1, speed: 1, capacity: 2, queue: [], active: [] };
    }
    if (!Array.isArray(game.workshop.queue)) game.workshop.queue = [];
    if (!Array.isArray(game.workshop.active)) game.workshop.active = [];
    if (!game.garageUpgrades || typeof game.garageUpgrades !== 'object') {
        game.garageUpgrades = { extraBay: 0, speedBoost: 0, partsStock: 0 };
    }
}

// ── repair_car(): accept a car into the workshop ──────────────────
function repair_car() {
    ensureWorkshopState();

    if (game.workshop.queue.length >= 5) {
        notifyWarn("Cola llena — espera a que haya espacio");
        return;
    }
    game.workshop.queue.push(generateCar());
    renderWorkshop();
}

function addCar() { repair_car(); }

function assignCars() {
    ensureWorkshopState();
    while (
        game.workshop.active.length < game.workshop.capacity &&
        game.workshop.queue.length > 0
    ) {
        game.workshop.active.push(game.workshop.queue.shift());
    }
}

// ── Garage upgrade costs ──────────────────────────────────────────
const GARAGE_UPGRADES_DEF = [
    {
        key:   "extraBay",
        label: "Bahía adicional",
        icon:  "🏗",
        desc:  "+1 auto simultáneo",
        max:   3,
        cost:  lvl => [8000, 22000, 55000][lvl] || 0
    },
    {
        key:   "speedBoost",
        label: "Herramientas Pro",
        icon:  "⚡",
        desc:  "+0.5 velocidad de reparación",
        max:   4,
        cost:  lvl => [5000, 14000, 32000, 75000][lvl] || 0
    },
    {
        key:   "partsStock",
        label: "Stock de repuestos",
        icon:  "📦",
        desc:  "-8% duración de reparación",
        max:   3,
        cost:  lvl => [4000, 12000, 30000][lvl] || 0
    }
];

function buyGarageUpgrade(key) {
    ensureWorkshopState();
    const def = GARAGE_UPGRADES_DEF.find(d => d.key === key);
    if (!def) return;

    const lvl  = game.garageUpgrades[key] || 0;
    if (lvl >= def.max) { notify("Mejora máxima alcanzada"); return; }

    const cost = def.cost(lvl);
    if (game.money < cost) { notifyWarn("Dinero insuficiente"); return; }

    game.money -= cost;
    game.garageUpgrades[key]++;

    if (key === "extraBay")   game.workshop.capacity = 2 + game.garageUpgrades.extraBay;
    if (key === "speedBoost") game.workshop.speed    = 1 + game.garageUpgrades.speedBoost * 0.5;

    notify(`${def.label} mejorado — nivel ${game.garageUpgrades[key]}`);
    renderWorkshop();
    if (window.FTUEManager) FTUEManager.onGarageUpgradePurchased();
}

function renderWorkshop() {
    ensureWorkshopState();
    const el = document.getElementById("workshopContent");
    if (!el) return;

    let html = `
        <div class="panel">
            <h3>Taller</h3>
            <p>💰 $${game.money || 0}</p>
            <p>🏆 Reputación: ${game.reputation || 0}</p>
            <button onclick="addCar()">Recibir Auto</button>
        </div>
        <div class="panel">
            <h3>En reparación</h3>
        </div>
    `;

    game.workshop.active.forEach(car => {
        html += `
            <div class="panel">
                <p>${car.rare ? "⭐ Auto raro" : "🚗 Auto normal"}</p>
                <p>${Math.floor((car.progress / car.duration) * 100)}%</p>
            </div>
        `;
    });

    html += `<div class="panel"><h3>En cola</h3></div>`;
    game.workshop.queue.forEach(car => {
        html += `
            <div class="panel">
                <p>${car.rare ? "⭐ Auto raro" : "🚗 Auto normal"}</p>
            </div>
        `;
    });

    el.innerHTML = html;
}

setInterval(() => {
    ensureWorkshopState();
    assignCars();

    const totalSpeed = (game.workshop.speed || 1) + getTotalMechanicSpeed();
    game.workshop.active.forEach(car => {
        car.progress += totalSpeed;
        game.money = Math.max(0, (game.money || 0) - 1);

        if (car.progress >= car.duration) {
            const boost  = game.sponsor ? game.sponsor.money : 1;
            const reward = Math.floor(car.reward * boost);
            game.money   += reward;
            addXP(car.rare ? 100 : 50);
            game.reputation = (game.reputation || 0) + (car.rare ? 2 : 1);
            notify("Auto terminado +$" + reward);
            game.workshop.active = game.workshop.active.filter(c => c.id !== car.id);
            if (window.FTUEManager) FTUEManager.onCarCompleted();
        }
    });

    if (workshopTab === "repair") renderWorkshop();
}, 1000);
