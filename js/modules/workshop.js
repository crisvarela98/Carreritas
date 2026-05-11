// ── Workshop Module ───────────────────────────────────────────────
// Handles customer car repairs (idle money-making loop)
// and garage upgrades.

let workshopTab = "repair";

function showWorkshopTab(tab) {
    workshopTab = tab;
    renderWorkshop();
}

// ── Customer car generation ───────────────────────────────────────
function generateCustomerCar() {
    const rare     = Math.random() < 0.15;
    const stockLvl = game.garageUpgrades.partsStock || 0;
    const durMult  = 1 - stockLvl * 0.1;
    return {
        id:       Date.now() + Math.random(),
        duration: Math.max(5, (12 + Math.random() * 10) * durMult),
        progress: 0,
        // Balanced rewards: max $150 rare, $60 normal
        reward:   rare ? 100 + Math.floor(Math.random() * 50) : 30 + Math.floor(Math.random() * 30),
        rare
    };
}

// ── repair_car() — accept customer car ────────────────────────────
function repair_car() {
    if (game.workshop.queue.length >= 5) {
        notifyWarn("Cola llena — espera un espacio libre");
        return;
    }
    game.workshop.queue.push(generateCustomerCar());
    renderWorkshop();
    if (window.FTUEManager) FTUEManager.onCarReceived();
}

function getTotalMechanicSpeed() {
    if (!Array.isArray(game.mechanics)) return 0;
    return game.mechanics.reduce((s, m) => s + (m.speed || 0), 0);
}

function assignCars() {
    if (!game.workshop || !Array.isArray(game.workshop.active)) return;
    while (
        game.workshop.active.length < game.workshop.capacity &&
        game.workshop.queue.length > 0
    ) {
        game.workshop.active.push(game.workshop.queue.shift());
    }
}

// ── Garage upgrades ───────────────────────────────────────────────
const GARAGE_UPGRADES_DEF = [
    { key: "extraBay",   label: "Bahía adicional",   icon: "🏗", desc: "+1 auto simultáneo",           max: 3, cost: lvl => [2500, 7000, 18000][lvl] || 0 },
    { key: "speedBoost", label: "Herramientas Pro",  icon: "⚡", desc: "+0.5 velocidad de reparación", max: 4, cost: lvl => [1800, 4500, 9000, 20000][lvl] || 0 },
    { key: "partsStock", label: "Stock de repuestos",icon: "📦", desc: "-10% duración por nivel",       max: 3, cost: lvl => [1500, 4000, 10000][lvl] || 0 }
];

function buyGarageUpgrade(key) {
    const def = GARAGE_UPGRADES_DEF.find(d => d.key === key);
    if (!def) return;
    const lvl = game.garageUpgrades[key] || 0;
    if (lvl >= def.max) { notify("Mejora máxima alcanzada"); return; }
    const cost = def.cost(lvl);
    if (!spend_coins(cost)) { notifyWarn("Monedas insuficientes"); return; }

    game.garageUpgrades[key]++;
    if (key === "extraBay")   game.workshop.capacity = 2 + game.garageUpgrades.extraBay;
    if (key === "speedBoost") game.workshop.speed    = 1 + game.garageUpgrades.speedBoost * 0.5;

    notifySuccess(`${def.label} mejorado — Nv.${game.garageUpgrades[key]}`);
    renderWorkshop();
    if (window.FTUEManager) FTUEManager.onGarageUpgradePurchased();
}

// ── Workshop tick (every second) ──────────────────────────────────
setInterval(() => {
    if (!game.workshop || !Array.isArray(game.workshop.active)) return;

    assignCars();
    const totalSpeed = (game.workshop.speed || 1) + getTotalMechanicSpeed();

    game.workshop.active.forEach(car => {
        car.progress += totalSpeed;
        // Small upkeep cost while repairing
        game.money = Math.max(0, game.money - 0.2);

        if (car.progress >= car.duration) {
            const boost  = game.sponsor ? game.sponsor.money : 1;
            const reward = Math.floor(car.reward * boost);
            earn_coins(reward);
            addXP(car.rare ? 60 : 25);
            game.reputation += car.rare ? 1 : 0;
            notify(`🚗 Auto terminado +$${reward}`, "success");
            game.workshop.active = game.workshop.active.filter(c => c.id !== car.id);
            if (window.FTUEManager) FTUEManager.onCarCompleted();
            // Stats & task tracking
            if (!game.stats) game.stats = {};
            game.stats.totalRepairs = (game.stats.totalRepairs || 0) + 1;
            if (window.TaskManager) {
                TaskManager.trackDaily('repair');
                TaskManager._updateBadge();
            }
        }
    });

    if (workshopTab === "repair") _renderRepairTab(document.getElementById("workshopContent"));
}, 1000);

// ── renderWorkshop() ─────────────────────────────────────────────
function renderWorkshop() {
    const el = document.getElementById("workshopContent");
    if (!el) return;

    if (workshopTab === "vehicles") {
        el.innerHTML = _makeTabBar() + `<div id="vehiclesTabContent"></div>`;
        renderVehiclesTab();
        return;
    }
    if (workshopTab === "garage") {
        _renderGarageTab(el);
        return;
    }
    _renderRepairTab(el);
}

function _makeTabBar() {
    return `
    <div class="wtab-bar">
        <button class="wtab ${workshopTab === "repair"   ? "wtab-active" : ""}" onclick="showWorkshopTab('repair')">🔧 Reparar</button>
        <button class="wtab ${workshopTab === "vehicles" ? "wtab-active" : ""}" onclick="showWorkshopTab('vehicles')">🚗 Vehículos</button>
        <button class="wtab ${workshopTab === "garage"   ? "wtab-active" : ""}" onclick="showWorkshopTab('garage')">🏗 Garage</button>
    </div>`;
}

function _renderRepairTab(el) {
    if (!el) return;

    let activeHtml = game.workshop.active.length === 0
        ? `<div class="empty-row">Sin autos en reparación</div>`
        : game.workshop.active.map(car => {
            const pct = Math.floor((car.progress / car.duration) * 100);
            const adBtn = AdsManager.canOffer("speed_repair")
                ? `<button class="rbtn ad-btn ad-btn-sm" onclick="AdsManager.offer_ad_to_speed_repair('${car.id}')">📺 Acelerar</button>`
                : "";
            return `
            <div class="car-card">
                <div class="car-card-top">
                    <span>${car.rare ? "⭐ Auto raro" : "🚗 Auto normal"}</span>
                    <span class="car-pct">${pct}%</span>
                </div>
                <div class="car-progress-track">
                    <div class="car-progress-fill ${car.rare ? "rare" : ""}" style="width:${pct}%"></div>
                </div>
                ${adBtn}
            </div>`;
        }).join("");

    let queueHtml = game.workshop.queue.length === 0
        ? `<div class="empty-row">Cola vacía</div>`
        : game.workshop.queue.map(car => `
            <div class="car-card queued">
                <span>${car.rare ? "⭐ Auto raro" : "🚗 Auto normal"}</span>
                <span class="car-queue-tag">en cola</span>
            </div>`).join("");

    const totalSpeed = (game.workshop.speed || 1) + getTotalMechanicSpeed();

    el.innerHTML = `
    ${_makeTabBar()}
    <div class="race-card">
        <div class="ws-top-row">
            <div>
                <div class="ws-money">💰 $${game.money.toLocaleString()}</div>
                <div class="ws-sub">Bahías: ${game.workshop.active.length}/${game.workshop.capacity} · Vel: ${totalSpeed.toFixed(1)}x</div>
            </div>
            <button class="rbtn accent-btn ws-recv-btn" onclick="repair_car()">+ Recibir</button>
        </div>
    </div>
    <div class="race-card">
        <div class="race-divider">EN REPARACIÓN</div>${activeHtml}
    </div>
    <div class="race-card">
        <div class="race-divider">EN COLA (${game.workshop.queue.length}/5)</div>${queueHtml}
    </div>`;
}

function _renderGarageTab(el) {
    const upgradesHtml = GARAGE_UPGRADES_DEF.map(def => {
        const lvl   = game.garageUpgrades[def.key] || 0;
        const maxed = lvl >= def.max;
        const cost  = maxed ? 0 : def.cost(lvl);
        const segs  = Array.from({ length: def.max }, (_, i) =>
            `<div class="part-seg ${i < lvl ? "seg-on" : ""}"></div>`).join("");

        return `
        <div class="part-card">
            <div class="part-header">
                <span class="part-icon">${def.icon}</span>
                <span class="part-name">${def.label}</span>
                <span class="part-lv">Nv.${lvl}/${def.max}</span>
            </div>
            <div class="part-desc">${def.desc}</div>
            <div class="part-segs">${segs}</div>
            ${maxed
                ? `<div class="part-maxed">✅ NIVEL MÁXIMO</div>`
                : `<button class="rbtn ${game.money >= cost ? "accent-btn" : ""}"
                           onclick="buyGarageUpgrade('${def.key}')"
                           ${game.money < cost ? "disabled" : ""}>
                       Mejorar — $${cost.toLocaleString()}
                   </button>`}
        </div>`;
    }).join("");

    el.innerHTML = `
    ${_makeTabBar()}
    <div class="race-card">
        <div class="race-hero-title">🏗 MEJORAS DEL GARAGE</div>
        ${upgradesHtml}
    </div>`;
}
