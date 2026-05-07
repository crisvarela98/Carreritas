const CAR_MAX_LEVEL = 5;

const CAR_PARTS = [
    { key: "engine",       label: "Motor",        icon: "⚙️",  hpPerLevel: 50, baseCost: 3000 },
    { key: "transmission", label: "Transmisión",  icon: "🔄",  hpPerLevel: 25, baseCost: 2000 },
    { key: "aero",         label: "Aerodinámica", icon: "💨",  hpPerLevel: 0,  baseCost: 2500 },
    { key: "wheels",       label: "Ruedas",       icon: "🛞",  hpPerLevel: 15, baseCost: 2000 },
];

function getCarHP() {
    const base = 350;
    return base
        + (game.car.engine       - 1) * 50
        + (game.car.transmission - 1) * 25
        + (game.car.wheels       - 1) * 15;
}

function getCarTorque() {
    return Math.round(getCarHP() * 1.36);
}

// ── tune_car(): upgrade a car part ───────────────────────────────
function tune_car(key) {
    const part = CAR_PARTS.find(p => p.key === key);
    const lvl  = game.car[key];
    if (lvl >= CAR_MAX_LEVEL) { notify("Nivel máximo alcanzado"); return; }
    const cost = part.baseCost * lvl;
    if (game.money < cost) { notifyWarn("Dinero insuficiente"); return; }
    game.money -= cost;
    game.car[key]++;
    notify(`${part.label} mejorado — Nivel ${game.car[key]}`, "success");
    renderCarUpgrades();

    // FTUE progress
    if (window.FTUEManager) FTUEManager.onCarUpgraded();
}

function upgradePart(key) { tune_car(key); }

let dynoRunning = false;

function runDynoTest() {
    if (dynoRunning) return;
    dynoRunning = true;

    const hp     = getCarHP();
    const torque = getCarTorque();

    const carEl = document.getElementById("dynoCar");
    const roll1 = document.getElementById("dynoRoll1");
    const roll2 = document.getElementById("dynoRoll2");
    const hpEl  = document.getElementById("dynoHP");
    const tqEl  = document.getElementById("dynoTQ");

    if (carEl) carEl.classList.add("dyno-shaking");
    if (roll1) roll1.classList.add("spinning");
    if (roll2) roll2.classList.add("spinning");

    let cur      = 0;
    const step   = Math.max(1, Math.ceil(hp / 50));
    const interval = setInterval(() => {
        cur = Math.min(cur + step, hp);
        if (hpEl) hpEl.textContent = cur;
        if (tqEl) tqEl.textContent = Math.round(cur * 1.36);
        if (cur >= hp) {
            clearInterval(interval);
            setTimeout(() => {
                if (carEl) carEl.classList.remove("dyno-shaking");
                if (roll1) roll1.classList.remove("spinning");
                if (roll2) roll2.classList.remove("spinning");
                dynoRunning = false;
            }, 1200);
        }
    }, 40);
}

function renderCarUpgrades() {
    const el = document.getElementById("carContent");
    if (!el) return;

    const hp     = getCarHP();
    const torque = getCarTorque();
    const maxHP  = 350 + (CAR_MAX_LEVEL - 1) * (50 + 25 + 15);
    const hpPct  = Math.round(((hp - 350) / (maxHP - 350)) * 100);

    const partsHtml = CAR_PARTS.map(part => {
        const lvl  = game.car[part.key];
        const cost = lvl < CAR_MAX_LEVEL ? part.baseCost * lvl : null;
        const segs = Array.from({ length: CAR_MAX_LEVEL }, (_, i) =>
            `<div class="part-seg ${i < lvl ? "seg-on" : ""}"></div>`
        ).join("");

        return `
            <div class="part-card">
                <div class="part-header">
                    <span class="part-icon">${part.icon}</span>
                    <span class="part-name">${part.label}</span>
                    <span class="part-lv">Nv.${lvl}</span>
                </div>
                <div class="part-segs">${segs}</div>
                ${lvl < CAR_MAX_LEVEL
                    ? `<button class="rbtn ${game.money >= cost ? "accent-btn" : ""}"
                               onclick="tune_car('${part.key}')"
                               ${game.money < cost ? "disabled" : ""}>
                           Mejorar — $${cost.toLocaleString()}
                       </button>`
                    : `<div class="part-maxed">✅ NIVEL MÁXIMO</div>`}
            </div>
        `;
    }).join("");

    el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title">🏎 AUTO DE CARRERAS</div>

            <div class="dyno-scene">
                <div class="dyno-car-wrap">
                    <span id="dynoCar" class="dyno-car-emoji">🏎</span>
                </div>
                <div class="dyno-rolls">
                    <div class="dyno-roll" id="dynoRoll1"></div>
                    <div class="dyno-roll" id="dynoRoll2"></div>
                </div>
            </div>

            <div class="dyno-readout">
                <div class="dyno-stat">
                    <div class="dyn-label">POTENCIA</div>
                    <div class="dyn-val hp-col"><span id="dynoHP">${hp}</span> <span class="dyn-unit">HP</span></div>
                </div>
                <div class="dyno-stat">
                    <div class="dyn-label">TORQUE</div>
                    <div class="dyn-val tq-col"><span id="dynoTQ">${torque}</span> <span class="dyn-unit">Nm</span></div>
                </div>
            </div>

            <div class="dyno-gauge-wrap">
                <div class="dyno-gauge-track">
                    <div class="dyno-gauge-fill" style="width:${hpPct}%"></div>
                </div>
                <div class="dyno-gauge-labels">
                    <span>350 HP</span>
                    <span>${maxHP} HP</span>
                </div>
            </div>

            <button class="rbtn" onclick="runDynoTest()">🔄 Test de rendimiento</button>
        </div>

        <div class="race-card">
            <div class="race-divider">MEJORAS DEL AUTO</div>
            ${partsHtml}
        </div>
    `;
}
