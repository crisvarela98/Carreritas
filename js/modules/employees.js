// ── Mechanics / Staff Module ──────────────────────────────────────

function openStaffSheet() {
    const sheet = document.getElementById('staffSheet');
    if (sheet) sheet.classList.add('psheet-open');
    const moneyEl = document.getElementById('staffSheetMoney');
    if (moneyEl) moneyEl.textContent = '$' + (game.money || 0).toLocaleString();
    renderEmployees();
}

function closeStaffSheet() {
    const sheet = document.getElementById('staffSheet');
    if (sheet) sheet.classList.remove('psheet-open');
}


// Speed is progress units added per second (car = 360s duration)
// With base workshop speed of 1:
//   Junior 0.8/s  → grouped car repair: ~280s (~4.5 min), stack more for faster
//   Senior 2.0/s  → meaningful upgrade
//   Expert 4.5/s  → pro tier
//   Pro    9.0/s  → premium, near-instant with stacking
// Total speed capped at 18/s in workshop tick (20s minimum on simple car)

const MECHANIC_CATALOG = [
    {
        id:       "rookie",
        name:     "Mecánico Junior",
        icon:     "🔧",
        speed:    0.8,
        hireCost: 600,
        salario:  100,    // flavor
        desc:     "Aprendiz — puede reparar autos simples. Contrata varios.",
        maxStack: 6,
        repairoLabel: "Auto simple: ~7 min solo"
    },
    {
        id:       "mid",
        name:     "Mecánico Senior",
        icon:     "⚙️",
        speed:    2.5,
        hireCost: 2500,
        salario:  400,
        desc:     "Experimentado — mucho más rápido que el junior.",
        maxStack: 4,
        repairoLabel: "Auto simple: ~4 min solo"
    },
    {
        id:       "expert",
        name:     "Mecánico Experto",
        icon:     "🛠",
        speed:    5.5,
        hireCost: 8000,
        salario:  1200,
        desc:     "El mejor del paddock — maneja estrellas sin problema.",
        maxStack: 3,
        repairoLabel: "Auto simple: ~2.5 min solo"
    },
    {
        id:       "premium",
        name:     "Ingeniero Pro",
        icon:     "🏎",
        speed:    9.0,
        hireCost: 0,
        salario:  0,
        desc:     "Ex-ingeniero de Fórmula 1. Velocidad máxima. 💎",
        maxStack: 2,
        repairoLabel: "Auto simple: ~90s solo",
        premium:  true
    }
];

function hire_mechanic(catalogId) {
    const def = MECHANIC_CATALOG.find(c => c.id === catalogId);
    if (!def) return;

    // Check stack limit
    const owned = game.mechanics.filter(m => m.catalogId === catalogId).length;
    if (owned >= def.maxStack) {
        notifyWarn(`Máximo de ${def.maxStack} ${def.name} alcanzado`);
        return;
    }

    if (def.premium) {
        spend_diamonds(10, () => { _doHire(def); });
        return;
    }

    if (!spend_coins(def.hireCost)) { notifyWarn("Monedas insuficientes"); return; }
    _doHire(def);
}

function _doHire(def) {
    game.mechanics.push({
        uid:      Date.now() + Math.random(),
        catalogId: def.id,
        name:     def.name,
        icon:     def.icon,
        speed:    def.speed
    });
    notifySuccess(`${def.icon} ${def.name} contratado!`);
    renderEmployees();
    if (!game.stats) game.stats = {};
    game.stats.totalStaff = (game.stats.totalStaff || 0) + 1;
    if (window.TaskManager) { TaskManager.trackDaily('hirestaff'); TaskManager._updateBadge(); }
    if (window.FTUEManager) FTUEManager.onMechanicHired();
}

function fireMechanic(catalogId) {
    // Fire one instance of this type
    const idx = game.mechanics.findIndex(m => m.catalogId === catalogId);
    if (idx === -1) return;
    game.mechanics.splice(idx, 1);
    notify("Mecánico despedido");
    renderEmployees();
}

function renderEmployees() {
    const el = document.getElementById("employeesContent");
    if (!el) return;

    const totalSpeed = Math.min(18, getTotalMechanicSpeed());

    // Group hired mechanics by type
    const hiredGroups = MECHANIC_CATALOG.map(def => {
        const count = game.mechanics.filter(m => m.catalogId === def.id).length;
        return { def, count };
    }).filter(g => g.count > 0);

    const hiredHtml = hiredGroups.length === 0
        ? `<div class="empty-row">Sin mecánicos — contratá uno para acelerar reparaciones</div>`
        : hiredGroups.map(({ def, count }) => `
        <div class="mech-card">
            <div class="mech-card-left">
                <span class="mech-icon">${def.icon}</span>
                <div>
                    <div class="mech-name">${def.name} <span class="mech-count-badge">×${count}</span></div>
                    <div class="mech-stats">+${(def.speed * count).toFixed(1)} vel/seg en total</div>
                </div>
            </div>
            <button class="mech-fire-btn" onclick="fireMechanic('${def.id}')">−1</button>
        </div>`).join("");

    const catalogHtml = MECHANIC_CATALOG.map(def => {
        const owned     = game.mechanics.filter(m => m.catalogId === def.id).length;
        const maxed     = owned >= def.maxStack;
        const canAfford = def.premium ? game.diamonds >= 10 : game.money >= def.hireCost;
        const costLabel = def.premium ? "10 💎" : `$${def.hireCost.toLocaleString()}`;

        return `
        <div class="mech-catalog-card ${def.premium ? "mech-premium" : ""}">
            <div class="mcc-left">
                <span class="mech-icon">${def.icon}</span>
                <div>
                    <div class="mech-name">
                        ${def.name}
                        ${def.premium ? `<span class="badge-premium">PRO</span>` : ""}
                        <span class="mech-slot-tag">${owned}/${def.maxStack}</span>
                    </div>
                    <div class="mech-stats">${def.desc}</div>
                    <div class="mech-speed-tag">+${def.speed} vel/seg · ${def.repairoLabel}</div>
                </div>
            </div>
            ${maxed
                ? `<button class="rbtn" disabled style="opacity:0.4">Lleno</button>`
                : `<button class="rbtn ${canAfford ? "accent-btn" : ""} mcc-hire-btn"
                        onclick="hire_mechanic('${def.id}')"
                        ${!canAfford ? "disabled" : ""}>
                    ${costLabel}
                   </button>`}
        </div>`;
    }).join("");

    // Effective repair speed explanation
    const baseSpeed = game.workshop.speed || 1;
    const simpleTime = Math.max(20, Math.round(360 / Math.min(18, baseSpeed + getTotalMechanicSpeed())));
    const starTime   = Math.max(40, Math.round(900 / Math.min(18, baseSpeed + getTotalMechanicSpeed())));

    el.innerHTML = `
    <div class="race-card">
        <div class="race-hero-title">👷 STAFF</div>
        <div class="staff-summary">
            <div class="ss-box"><div class="ss-label">Contratados</div><div class="ss-val">${game.mechanics.length}</div></div>
            <div class="ss-box"><div class="ss-label">Vel. total</div><div class="ss-val">+${totalSpeed.toFixed(1)}/s</div></div>
            <div class="ss-box"><div class="ss-label">Dinero</div><div class="ss-val green">$${game.money.toLocaleString()}</div></div>
        </div>
        <div style="font-size:11px;color:var(--text-muted);text-align:center;padding:6px 0 2px">
            ⏱ Auto simple: ~${simpleTime}s · Auto estrella: ~${starTime}s
        </div>
    </div>
    <div class="race-card">
        <div class="race-divider">TU EQUIPO</div>
        ${hiredHtml}
    </div>
    <div class="race-card">
        <div class="race-divider">CONTRATAR</div>
        ${catalogHtml}
    </div>`;
}
