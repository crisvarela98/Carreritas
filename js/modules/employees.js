// ── Mechanics / Staff Module ──────────────────────────────────────

const MECHANIC_CATALOG = [
    { id: "rookie",  name: "Mecánico Junior",  icon: "🔧", speed: 0.5, hireCost: 400,   desc: "Aprendiz, lento pero barato" },
    { id: "mid",     name: "Mecánico Senior",  icon: "⚙️", speed: 1.0, hireCost: 1200,  desc: "Experimentado y eficiente" },
    { id: "expert",  name: "Mecánico Experto", icon: "🛠", speed: 1.8, hireCost: 3500,  desc: "El mejor del paddock" },
    { id: "premium", name: "Ingeniero Pro",    icon: "🏎", speed: 3.0, hireCost: 0,     desc: "Ex-ingeniero de Fórmula", premium: true }
];

function hire_mechanic(catalogId) {
    const def = MECHANIC_CATALOG.find(c => c.id === catalogId);
    if (!def) return;

    if (def.premium) {
        spend_diamonds(10, () => {
            _doHire(def);
        });
        return;
    }

    if (!spend_coins(def.hireCost)) { notifyWarn("Monedas insuficientes"); return; }
    _doHire(def);
}

function _doHire(def) {
    game.mechanics.push({
        uid:      Date.now(),
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

function fireMechanic(uid) {
    game.mechanics = game.mechanics.filter(m => m.uid !== uid);
    notify("Mecánico despedido");
    renderEmployees();
}

function renderEmployees() {
    const el = document.getElementById("employeesContent");
    if (!el) return;

    const totalSpeed = getTotalMechanicSpeed();

    const hiredHtml = game.mechanics.length === 0
        ? `<div class="empty-row">Sin mecánicos — contrátalo para acelerar reparaciones</div>`
        : game.mechanics.map(m => `
        <div class="mech-card">
            <div class="mech-card-left">
                <span class="mech-icon">${m.icon}</span>
                <div>
                    <div class="mech-name">${m.name}</div>
                    <div class="mech-stats">+${m.speed} vel/seg</div>
                </div>
            </div>
            <button class="mech-fire-btn" onclick="fireMechanic(${m.uid})">✕</button>
        </div>`).join("");

    const catalogHtml = MECHANIC_CATALOG.map(def => {
        const canAfford = def.premium ? game.diamonds >= 10 : game.money >= def.hireCost;
        const costLabel = def.premium ? "10 💎" : `$${def.hireCost.toLocaleString()}`;

        return `
        <div class="mech-catalog-card ${def.premium ? "mech-premium" : ""}">
            <div class="mcc-left">
                <span class="mech-icon">${def.icon}</span>
                <div>
                    <div class="mech-name">${def.name} ${def.premium ? `<span class="badge-premium">PRO</span>` : ""}</div>
                    <div class="mech-stats">${def.desc}</div>
                    <div class="mech-speed-tag">+${def.speed} velocidad/seg</div>
                </div>
            </div>
            <button class="rbtn ${canAfford ? "accent-btn" : ""} mcc-hire-btn"
                    onclick="hire_mechanic('${def.id}')"
                    ${!canAfford ? "disabled" : ""}>
                ${costLabel}
            </button>
        </div>`;
    }).join("");

    el.innerHTML = `
    <div class="race-card">
        <div class="race-hero-title">👷 STAFF</div>
        <div class="staff-summary">
            <div class="ss-box"><div class="ss-label">Contratados</div><div class="ss-val">${game.mechanics.length}</div></div>
            <div class="ss-box"><div class="ss-label">Velocidad</div><div class="ss-val">+${totalSpeed.toFixed(1)}</div></div>
            <div class="ss-box"><div class="ss-label">Diamantes</div><div class="ss-val">💎 ${game.diamonds}</div></div>
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
