let workshopTab = "repair";

function showWorkshopTab(tab) {
    workshopTab = tab;
    renderWorkshop();
}

// ── Car generation ────────────────────────────────────────────────
function generateCar() {
    const rare     = Math.random() < 0.2;
    const stockLvl = game.garageUpgrades.partsStock || 0;
    const durationReduction = 1 - stockLvl * 0.1;

    return {
        id:       Date.now() + Math.random(),
        duration: Math.max(5, (10 + Math.random() * 10) * durationReduction),
        progress: 0,
        reward:   rare ? 500 : 150,
        rare
    };
}

// ── repair_car(): accept a car into the workshop ──────────────────
function repair_car() {
    if (game.workshop.queue.length >= 5) {
        notifyWarn("Cola llena — espera a que haya espacio");
        return;
    }
    game.workshop.queue.push(generateCar());
    renderWorkshop();

    // FTUE progress
    if (window.FTUEManager) FTUEManager.onCarReceived();
}

function addCar() { repair_car(); }

function assignCars() {
    if (!game.workshop || !Array.isArray(game.workshop.active)) return;
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
        cost:  lvl => [2000, 5000, 12000][lvl] || 0
    },
    {
        key:   "speedBoost",
        label: "Herramientas Pro",
        icon:  "⚡",
        desc:  "+0.5 velocidad de reparación",
        max:   4,
        cost:  lvl => [1500, 3500, 7000, 15000][lvl] || 0
    },
    {
        key:   "partsStock",
        label: "Stock de repuestos",
        icon:  "📦",
        desc:  "-10% duración de reparación",
        max:   3,
        cost:  lvl => [1200, 3000, 8000][lvl] || 0
    }
];

function buyGarageUpgrade(key) {
    const def = GARAGE_UPGRADES_DEF.find(d => d.key === key);
    if (!def) return;

    const lvl  = game.garageUpgrades[key] || 0;
    if (lvl >= def.max) { notify("Mejora máxima alcanzada"); return; }

    const cost = def.cost(lvl);
    if (game.money < cost) { notifyWarn("Dinero insuficiente"); return; }

    game.money -= cost;
    game.garageUpgrades[key]++;

    // Apply effects immediately
    if (key === "extraBay")   game.workshop.capacity = 2 + game.garageUpgrades.extraBay;
    if (key === "speedBoost") game.workshop.speed    = 1 + game.garageUpgrades.speedBoost * 0.5;

    notify(`${def.label} mejorado — nivel ${game.garageUpgrades[key]}`);
    renderWorkshop();

    // FTUE progress
    if (window.FTUEManager) FTUEManager.onGarageUpgradePurchased();
}

// ── Render workshop ───────────────────────────────────────────────
function renderWorkshop() {
    const el = document.getElementById("workshopContent");
    if (!el) return;

    const tabBar = `
        <div class="wtab-bar">
            <button class="wtab ${workshopTab === "repair"  ? "wtab-active" : ""}" onclick="showWorkshopTab('repair')">🔧 Reparaciones</button>
            <button class="wtab ${workshopTab === "car"     ? "wtab-active" : ""}" onclick="showWorkshopTab('car')">🏎 Auto</button>
            <button class="wtab ${workshopTab === "garage"  ? "wtab-active" : ""}" onclick="showWorkshopTab('garage')">🏗 Garage</button>
        </div>
    `;

    if (workshopTab === "car") {
        el.innerHTML = tabBar + `<div id="carContent"></div>`;
        renderCarUpgrades();
        return;
    }

    if (workshopTab === "garage") {
        renderGarageUpgradesTab(el, tabBar);
        return;
    }

    // ── Repair tab ────────────────────────────────────────────────
    let activeHtml = "";
    if (game.workshop.active.length === 0) {
        activeHtml = `<div class="empty-row">Sin autos en reparación</div>`;
    } else {
        game.workshop.active.forEach(car => {
            const pct = Math.floor((car.progress / car.duration) * 100);
            activeHtml += `
                <div class="car-card">
                    <div class="car-card-top">
                        <span>${car.rare ? "⭐ Auto raro" : "🚗 Auto normal"}</span>
                        <span class="car-pct">${pct}%</span>
                    </div>
                    <div class="car-progress-track">
                        <div class="car-progress-fill ${car.rare ? "rare" : ""}" style="width:${pct}%"></div>
                    </div>
                    ${AdsManager.canOffer("speed_repair")
                        ? `<button class="rbtn ad-btn ad-btn-sm" onclick="AdsManager.offer_ad_to_speed_repair('${car.id}')">📺 Ver anuncio para acelerar</button>`
                        : ""}
                </div>
            `;
        });
    }

    let queueHtml = "";
    if (game.workshop.queue.length === 0) {
        queueHtml = `<div class="empty-row">Cola vacía</div>`;
    } else {
        game.workshop.queue.forEach(car => {
            queueHtml += `
                <div class="car-card queued">
                    <span>${car.rare ? "⭐ Auto raro" : "🚗 Auto normal"}</span>
                    <span class="car-queue-tag">en cola</span>
                </div>
            `;
        });
    }

    el.innerHTML = `
        ${tabBar}
        <div class="race-card">
            <div class="ws-top-row">
                <div>
                    <div class="ws-money">💰 $${game.money.toLocaleString()}</div>
                    <div class="ws-sub">Bahías: ${game.workshop.active.length}/${game.workshop.capacity} · Velocidad: ${(game.workshop.speed + getTotalMechanicSpeed()).toFixed(1)}x</div>
                </div>
                <button class="rbtn accent-btn ws-recv-btn" onclick="repair_car()">+ Recibir Auto</button>
            </div>
        </div>

        <div class="race-card">
            <div class="race-divider">EN REPARACIÓN</div>
            ${activeHtml}
        </div>

        <div class="race-card">
            <div class="race-divider">EN COLA (${game.workshop.queue.length}/5)</div>
            ${queueHtml}
        </div>
    `;
}

function renderGarageUpgradesTab(el, tabBar) {
    const upgradesHtml = GARAGE_UPGRADES_DEF.map(def => {
        const lvl  = game.garageUpgrades[def.key] || 0;
        const maxed = lvl >= def.max;
        const cost  = maxed ? null : def.cost(lvl);

        const segs = Array.from({ length: def.max }, (_, i) =>
            `<div class="part-seg ${i < lvl ? "seg-on" : ""}"></div>`
        ).join("");

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
            </div>
        `;
    }).join("");

    el.innerHTML = `
        ${tabBar}
        <div class="race-card">
            <div class="race-hero-title">🏗 MEJORAS DEL GARAGE</div>
            ${upgradesHtml}
        </div>
    `;
}

// ── Workshop tick ─────────────────────────────────────────────────
setInterval(() => {
    if (!game.workshop || !Array.isArray(game.workshop.active)) return;

    assignCars();

    const totalSpeed = (game.workshop.speed || 1) + getTotalMechanicSpeed();

    game.workshop.active.forEach(car => {
        car.progress += totalSpeed;
        game.money = Math.max(0, game.money - 1);

        if (car.progress >= car.duration) {
            const boost  = game.sponsor ? game.sponsor.money : 1;
            const reward = Math.floor(car.reward * boost);
            game.money   += reward;
            addXP(car.rare ? 100 : 50);
            game.reputation += car.rare ? 2 : 1;
            notify("Auto terminado +$" + reward);
            game.workshop.active = game.workshop.active.filter(c => c.id !== car.id);

            // FTUE progress
            if (window.FTUEManager) FTUEManager.onCarCompleted();
        }
    });

    if (workshopTab === "repair") renderWorkshop();
}, 1000);
