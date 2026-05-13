// ── Upgrade System ────────────────────────────────────────────────

const UPGRADE_PARTS = [
    { key: "motor",      label: "Motor",       icon: "⚙️",  desc: "Potencia base del vehículo",      pacePerLevel: 2.0, max: 5 },
    { key: "turbo",      label: "Turbo",       icon: "💨",  desc: "Boost de aceleración y potencia",  pacePerLevel: 1.5, max: 5 },
    { key: "brakes",     label: "Frenos",      icon: "🛑",  desc: "Mayor control en frenadas",        pacePerLevel: 0.8, max: 5 },
    { key: "tires",      label: "Neumáticos",  icon: "🛞",  desc: "Agarre y velocidad en curvas",     pacePerLevel: 1.2, max: 5 },
    { key: "suspension", label: "Suspensión",  icon: "🔩",  desc: "Estabilidad y manejo",             pacePerLevel: 0.6, max: 5 }
];

// Base upgrade cost multiplier per vehicle type
const VEHICLE_UPGRADE_BASE = {
    car:     1500,
    moto:    2000,
    rally:   3500,
    formula: 6000
};

function getUpgradeCost(vehicleId, partKey) {
    const veh  = game.vehicles[vehicleId];
    const base = VEHICLE_UPGRADE_BASE[vehicleId] || 1500;
    const lvl  = veh ? (veh.upgrades[partKey] || 0) : 0;

    // Turbo starts at 0 (costs more to unlock first level)
    if (partKey === "turbo" && lvl === 0) return base * 1.5;

    return base * Math.pow(1.8, lvl);
}

const VEHICLE_UPGRADE_DIAMOND_COST = 15; // all vehicles: level 5 costs 15 💎

// ── upgrade_vehicle() ─────────────────────────────────────────────
function upgrade_vehicle(vehicleId, partKey) {
    const def  = UPGRADE_PARTS.find(p => p.key === partKey);
    const veh  = game.vehicles[vehicleId];
    const vDef = VEHICLE_CATALOG[vehicleId];

    if (!def || !veh || !vDef) return;
    if (!veh.owned) { notifyWarn("Vehículo no desbloqueado"); return; }

    const currentLvl  = veh.upgrades[partKey] || 0;
    if (currentLvl >= def.max) { notify("Nivel máximo alcanzado"); return; }

    const isMaxUpgrade = currentLvl === def.max - 1;

    if (isMaxUpgrade) {
        if ((game.diamonds || 0) < VEHICLE_UPGRADE_DIAMOND_COST) {
            notifyWarn(`💎 Necesitás ${VEHICLE_UPGRADE_DIAMOND_COST} diamantes para la mejora máxima`);
            return;
        }
        game.diamonds -= VEHICLE_UPGRADE_DIAMOND_COST;
        veh.upgrades[partKey] = currentLvl + 1;
        notifySuccess(`${def.icon} ${def.label} — NIVEL MÁXIMO 💎 usados`);
    } else {
        const cost = Math.floor(getUpgradeCost(vehicleId, partKey));
        if (!spend_coins(cost)) { notifyWarn("Monedas insuficientes"); return; }
        veh.upgrades[partKey] = currentLvl + 1;
        notifySuccess(`${def.icon} ${def.label} mejorado — Nivel ${veh.upgrades[partKey]}`);
    }

    renderVehiclesTab();

    if (!game.stats) game.stats = {};
    game.stats.totalUpgCar = (game.stats.totalUpgCar || 0) + 1;
    if (window.TaskManager) { TaskManager.trackDaily('upgradecar'); TaskManager._updateBadge(); }
    if (window.FTUEManager) FTUEManager.onCarUpgraded();
}

// ── Render vehicles tab inside workshop ───────────────────────────
function renderVehiclesTab() {
    const el = document.getElementById("vehiclesTabContent");
    if (!el) return;

    const html = Object.values(VEHICLE_CATALOG).map(def => {
        const veh   = game.vehicles[def.id];
        const owned = veh && veh.owned;
        const stats = owned ? getVehicleStats(def.id) : null;
        const pace  = owned ? getVehiclePace(def.id).toFixed(2) : null;

        if (!owned) {
            return `
            <div class="vehicle-card vehicle-locked" style="border-left:4px solid #334155">
                <div class="vc-header">
                    <span class="vc-icon">${def.icon}</span>
                    <div>
                        <div class="vc-name">🔒 ${def.name}</div>
                        <div class="vc-desc">${def.desc}</div>
                        <div class="vc-unlock">Se desbloquea en Nivel ${def.unlockLevel}</div>
                    </div>
                </div>
            </div>`;
        }

        const partsHtml = UPGRADE_PARTS.map(part => {
            const lvl          = veh.upgrades[part.key] || 0;
            const maxed        = lvl >= part.max;
            const isMaxUpgrade = lvl === part.max - 1;
            const cost         = (maxed || isMaxUpgrade) ? 0 : Math.floor(getUpgradeCost(def.id, part.key));
            const canAfMoney   = game.money >= cost;
            const canAfDia     = (game.diamonds || 0) >= VEHICLE_UPGRADE_DIAMOND_COST;
            const segs  = Array.from({ length: part.max }, (_, i) =>
                `<div class="part-seg ${i < lvl ? "seg-on" : ""}"></div>`
            ).join("");

            let btn;
            if (maxed) {
                btn = `<div class="part-maxed">MAX</div>`;
            } else if (isMaxUpgrade) {
                btn = `<button class="rbtn ${canAfDia ? "diamond-btn" : ""} ur-btn"
                               onclick="upgrade_vehicle('${def.id}','${part.key}')"
                               ${!canAfDia ? "disabled" : ""}>
                           💎 ${VEHICLE_UPGRADE_DIAMOND_COST}
                       </button>`;
            } else {
                btn = `<button class="rbtn ${canAfMoney ? "accent-btn" : ""} ur-btn"
                               onclick="upgrade_vehicle('${def.id}','${part.key}')"
                               ${!canAfMoney ? "disabled" : ""}>
                           $${cost.toLocaleString()}
                       </button>`;
            }

            return `
            <div class="upgrade-row">
                <div class="ur-left">
                    <span class="ur-icon">${part.icon}</span>
                    <div>
                        <div class="ur-name">${part.label} <span class="ur-lv">Nv.${lvl}/${part.max}</span></div>
                        <div class="ur-desc">${part.desc} · -${part.pacePerLevel}s/nv</div>
                        <div class="part-segs">${segs}</div>
                    </div>
                </div>
                ${btn}
            </div>`;
        }).join("");

        return `
        <div class="vehicle-card" style="border-left:4px solid ${def.color}">
            <div class="vc-header">
                <span class="vc-icon">${def.icon}</span>
                <div class="vc-info">
                    <div class="vc-name">${def.name}</div>
                    <div class="vc-desc">${def.desc}</div>
                </div>
                <div class="vc-pace">
                    <div class="vc-pace-label">Ritmo</div>
                    <div class="vc-pace-val" style="color:${def.color}">${pace}s</div>
                </div>
            </div>
            <div class="vc-stats-row">
                <div class="vc-stat"><span>${stats.hp}</span><small>HP</small></div>
                <div class="vc-stat"><span>${stats.torque}</span><small>Nm</small></div>
                <div class="vc-stat"><span>${stats.cv}</span><small>CV</small></div>
            </div>
            <div class="vc-upgrades">
                <div class="race-divider" style="margin-top:6px">MEJORAS</div>
                ${partsHtml}
            </div>
        </div>`;
    }).join("");

    el.innerHTML = html;
}
