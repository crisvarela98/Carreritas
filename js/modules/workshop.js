// ── Workshop Module ───────────────────────────────────────────────

let workshopTab = "garage";

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

function showWorkshopTab(tab) {
    workshopTab = tab;
    renderWorkshop();
}

// ── Customer car generation ───────────────────────────────────────
// Simple car: 360s (6 min), Star car: 900s (15 min)
function generateCustomerCar() {
    const rare     = Math.random() < 0.15;
    const stockLvl = game.garageUpgrades.partsStock || 0;
    const durMult  = 1 - stockLvl * 0.08;

    const baseDuration = rare ? 900 : 360;   // 15 min star / 6 min simple
    return {
        id:       Date.now() + Math.random(),
        duration: Math.max(60, Math.round(baseDuration * durMult)),
        progress: 0,
        reward:   rare ? 1800 + Math.floor(Math.random() * 600) : 600 + Math.floor(Math.random() * 200),
        rare
    };
}

// ── repair_car() — accept customer car ────────────────────────────
function repair_car() {
    ensureWorkshopState();
    if (game.workshop.queue.length >= 5) {
        notifyWarn("¡Plaza llena! (5 en espera) — espera que se libere un lugar.");
        return;
    }
    game.workshop.queue.push(generateCustomerCar());
    renderDashboardCars();
    if (window.FTUEManager) FTUEManager.onCarReceived();
}

function getTotalMechanicSpeed() {
    if (!Array.isArray(game.mechanics)) return 0;
    return game.mechanics.reduce((s, m) => s + (m.speed || 0), 0);
}

function assignCars() {
    ensureWorkshopState();
    while (
        game.workshop.active.length < game.workshop.capacity &&
        game.workshop.queue.length > 0
    ) {
        game.workshop.active.push(game.workshop.queue.shift());
    }
}

// ── Garage upgrades ───────────────────────────────────────────────
const GARAGE_UPGRADES_DEF = [
    { key: "speedBoost", label: "Herramientas Pro",  icon: "⚡", desc: "+0.5 velocidad de reparación por nivel", max: 6, cost: lvl => [1800, 4500, 9000, 16000, 26000, 40000][lvl] || 0 },
    { key: "partsStock", label: "Stock de repuestos",icon: "📦", desc: "-8% duración de reparación por nivel",   max: 5, cost: lvl => [1500, 4000, 8000, 15000, 28000][lvl] || 0 }
];

function buyGarageUpgrade(key) {
    const def = GARAGE_UPGRADES_DEF.find(d => d.key === key);
    if (!def) return;
    const lvl = game.garageUpgrades[key] || 0;
    if (lvl >= def.max) { notify("Mejora máxima alcanzada"); return; }
    const cost = def.cost(lvl);
    if (!spend_coins(cost)) { notifyWarn("Monedas insuficientes"); return; }

    game.garageUpgrades[key]++;
    if (key === "speedBoost") game.workshop.speed = 1 + game.garageUpgrades.speedBoost * 0.5;

    notifySuccess(`${def.label} mejorado — Nv.${game.garageUpgrades[key]}`);
    if (!game.stats) game.stats = {};
    game.stats.totalUpgGar = (game.stats.totalUpgGar || 0) + 1;
    renderWorkshop();
    if (window.TaskManager) { TaskManager.trackDaily('upgradegarage'); TaskManager._updateBadge(); }
    if (window.FTUEManager) FTUEManager.onGarageUpgradePurchased();
}

// ── Dashboard car visual layer ────────────────────────────────────
function renderDashboardCars() {
    ensureWorkshopState();
    const layer = document.getElementById('garageCarLayer');
    if (!layer) return;

    const capacity = game.workshop.capacity || 2;
    const active = game.workshop.active;
    const queue = game.workshop.queue;

    const elevHtml = Array.from({ length: capacity }, (_, i) => {
        const car = active[i];
        if (!car) {
            return `<div class="garage-elevator-slot garage-slot-empty">
                <div class="gslot-label">BAHÍA ${i + 1}</div>
                <div class="gslot-empty">Libre</div>
            </div>`;
        }
        const pct     = Math.min(100, Math.floor((car.progress / car.duration) * 100));
        const remSecs = Math.max(0, Math.ceil(car.duration - car.progress));
        const timeStr = remSecs >= 60
            ? `${Math.floor(remSecs / 60)}:${String(remSecs % 60).padStart(2, '0')}`
            : `${remSecs}s`;
        return `<div class="garage-elevator-slot" onclick="showCarVideoPopup('${car.id}')">
            <div class="gslot-type">${car.rare ? '⭐' : '🚗'}</div>
            <div class="gslot-timer">${timeStr}</div>
            <div class="gslot-pbar"><div class="gslot-pfill${car.rare ? ' pfill-rare' : ''}" style="width:${pct}%"></div></div>
            <div class="gslot-tap">📺 Ver video</div>
        </div>`;
    }).join('');

    const parkHtml = Array.from({ length: 5 }, (_, i) => {
        const car = queue[i];
        if (!car) return `<div class="garage-parking-slot gpark-empty"></div>`;
        return `<div class="garage-parking-slot">
            <div class="gpark-car">${car.rare ? '⭐' : '🚗'}</div>
            <div class="gpark-label">#${i + 1}</div>
        </div>`;
    }).join('');

    layer.innerHTML = `
        <div class="garage-elevators">${elevHtml}</div>
        <div class="garage-parking">${parkHtml}</div>
    `;
}

// ── Car video popup — video completes repair instantly ────────────
function showCarVideoPopup(carId) {
    const car = game.workshop.active.find(c => String(c.id) === String(carId));
    if (!car) return;

    let popup = document.getElementById('carVideoPopup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'carVideoPopup';
        popup.className = 'car-video-popup-overlay';
        popup.onclick = e => { if (e.target === popup) popup.classList.remove('cvp-open'); };
        (document.getElementById('app') || document.body).appendChild(popup);
    }

    const pct     = Math.min(100, Math.floor((car.progress / car.duration) * 100));
    const remSecs = Math.max(0, Math.ceil(car.duration - car.progress));
    const timeStr = remSecs >= 60
        ? `${Math.floor(remSecs / 60)}:${String(remSecs % 60).padStart(2, '0')}`
        : `${remSecs}s`;

    popup.innerHTML = `
    <div class="cvp-panel">
        <div class="cvp-car">${car.rare ? '⭐ Auto Estrella' : '🚗 Auto Simple'}</div>
        <div class="cvp-time">⏱ Tiempo restante: <strong>${timeStr}</strong></div>
        <div class="cvp-pbar-wrap"><div class="cvp-pbar" style="width:${pct}%"></div></div>
        <div class="cvp-reward">Recompensa: <strong>$${car.reward.toLocaleString()}</strong></div>
        <button class="rbtn accent-btn cvp-ad-btn"
            onclick="AdsManager.offer_ad_to_speed_repair('${carId}'); document.getElementById('carVideoPopup').classList.remove('cvp-open')">
            📺 Ver video — Completar al instante
        </button>
        <button class="rbtn cvp-cancel"
            onclick="document.getElementById('carVideoPopup').classList.remove('cvp-open')">
            Cancelar
        </button>
    </div>`;
    popup.classList.add('cvp-open');
}

// ── Workshop tick (every second) ──────────────────────────────────
setInterval(() => {
    if (!game.workshop || !Array.isArray(game.workshop.active)) return;

    assignCars();
    const mechSpeed  = getTotalMechanicSpeed();
    // Cap total speed so minimum repair time is ~20 seconds on a simple car
    const MAX_SPEED  = 360 / 20;  // = 18 units/s
    const totalSpeed = Math.min(MAX_SPEED, (game.workshop.speed || 1) + mechSpeed);

    game.workshop.active.forEach(car => {
        car.progress += totalSpeed;

        if (car.progress >= car.duration) {
            const boost  = game.sponsor ? game.sponsor.money : 1;
            const reward = Math.floor(car.reward * boost);
            earn_coins(reward);
            addXP(car.rare ? 120 : 40);
            game.reputation += car.rare ? 2 : 0;
            notify(`🚗 Auto terminado +$${reward.toLocaleString()}`, "success");
            game.workshop.active = game.workshop.active.filter(c => c.id !== car.id);
            if (window.FTUEManager) FTUEManager.onCarCompleted();
            if (!game.stats) game.stats = {};
            game.stats.totalRepairs = (game.stats.totalRepairs || 0) + 1;
            if (window.TaskManager) { TaskManager.trackDaily('repair'); TaskManager._updateBadge(); }
        }
    });

    renderDashboardCars();

}, 1000);

// ── Workshop Sheet open / close ───────────────────────────────────
function openWorkshopSheet() {
    const sheet = document.getElementById('workshopSheet');
    if (sheet) sheet.classList.add('psheet-open');
    const moneyEl = document.getElementById('workshopSheetMoney');
    if (moneyEl) moneyEl.textContent = '$' + (game.money || 0).toLocaleString();
    renderWorkshop();
}

function closeWorkshopSheet() {
    const sheet = document.getElementById('workshopSheet');
    if (sheet) sheet.classList.remove('psheet-open');
}

// ── renderWorkshop() ─────────────────────────────────────────────
function renderWorkshop() {
    const el = document.getElementById("workshopContent");
    if (!el) return;

    if (workshopTab === "vehicles") {
        el.innerHTML = _makeTabBar() + `<div id="vehiclesTabContent"></div>`;
        if (typeof renderVehiclesTab === 'function') renderVehiclesTab();
        return;
    }
    _renderGarageTab(el);
}

function _makeTabBar() {
    return `
    <div class="wtab-bar">
        <button class="wtab ${workshopTab === "vehicles" ? "wtab-active" : ""}" onclick="showWorkshopTab('vehicles')">🚗 Vehículos</button>
        <button class="wtab ${workshopTab === "garage"   ? "wtab-active" : ""}" onclick="showWorkshopTab('garage')">🏗 Garage</button>
    </div>`;
}

function _renderGarageTab(el) {
    ensureWorkshopState();
    const totalSpeed = Math.min(18, (game.workshop.speed || 1) + getTotalMechanicSpeed());

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
        <div class="ws-sub" style="margin-bottom:4px">
            💵 <strong>$${game.money.toLocaleString()}</strong> disponibles
        </div>
        <div class="ws-sub" style="margin-bottom:8px">
            Bahías: ${game.workshop.active.length}/${game.workshop.capacity} · Vel. reparación: ${totalSpeed.toFixed(1)}/s
        </div>
        ${upgradesHtml}
    </div>`;
}
