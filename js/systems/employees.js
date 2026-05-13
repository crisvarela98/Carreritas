const MECHANIC_CATALOG = [
    { id: "rookie",   name: "Mecánico Junior",  icon: "🔧", speed: 0.4, hireCost: 2500,   salaryPerMin: 10,  desc: "Aprendiz, lento pero barato" },
    { id: "mid",      name: "Mecánico Senior",  icon: "⚙️", speed: 0.9, hireCost: 8000,   salaryPerMin: 22, desc: "Experimentado, buen ritmo" },
    { id: "expert",   name: "Mecánico Experto", icon: "🛠", speed: 1.6, hireCost: 22000,  salaryPerMin: 45, desc: "El mejor del paddock" },
    { id: "premium",  name: "Ingeniero F1",     icon: "🏎", speed: 2.8, hireCost: 60000,  salaryPerMin: 120, desc: "Ex-equipo de fórmula 1", premium: true }
];

function getTotalMechanicSpeed() {
    if (!Array.isArray(game.mechanics)) return 0;
    return game.mechanics.reduce((sum, m) => sum + (m.speed || 0), 0);
}

function hire_mechanic(catalogId) {
    const def = MECHANIC_CATALOG.find(c => c.id === catalogId);
    if (!def) return;

    // Premium pack check (IAP hook)
    if (def.premium && !IAPManager.isOwned("mechanic_premium_pack")) {
        IAPManager.purchase("mechanic_premium_pack", () => _doHire(def));
        return;
    }

    if (game.money < def.hireCost) { notifyWarn("Dinero insuficiente"); return; }
    game.money -= def.hireCost;
    _doHire(def);
}

function _doHire(def) {
    game.mechanics.push({
        uid:         Date.now(),
        catalogId:   def.id,
        name:        def.name,
        icon:        def.icon,
        speed:       def.speed,
        hireCost:    def.hireCost,
        salaryPerMin: def.salaryPerMin
    });

    notify(`${def.icon} ${def.name} contratado!`, "success");
    renderEmployees();

    // FTUE progress
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
        ? `<div class="empty-row">Sin mecánicos contratados</div>`
        : game.mechanics.map(m => `
            <div class="mech-card">
                <div class="mech-card-left">
                    <span class="mech-icon">${m.icon}</span>
                    <div>
                        <div class="mech-name">${m.name}</div>
                        <div class="mech-stats">+${m.speed} vel · $${m.salaryPerMin}/min</div>
                    </div>
                </div>
                <button class="mech-fire-btn" onclick="fireMechanic(${m.uid})">✕</button>
            </div>
        `).join("");

    const catalogHtml = MECHANIC_CATALOG.map(def => {
        const alreadyHired = game.mechanics.filter(m => m.catalogId === def.id).length;
        const canAfford    = game.money >= def.hireCost;

        return `
            <div class="mech-catalog-card ${def.premium ? "mech-premium" : ""}">
                <div class="mcc-left">
                    <span class="mech-icon">${def.icon}</span>
                    <div>
                        <div class="mech-name">${def.name} ${def.premium ? '<span class="badge-premium">PRO</span>' : ""}</div>
                        <div class="mech-stats">${def.desc}</div>
                        <div class="mech-speed-tag">+${def.speed} vel/seg · $${def.salaryPerMin}/min</div>
                    </div>
                </div>
                <button class="rbtn ${canAfford ? "accent-btn" : ""} mcc-hire-btn"
                        onclick="hire_mechanic('${def.id}')"
                        ${!canAfford && !def.premium ? "disabled" : ""}>
                    ${def.premium ? "💎 IAP" : `$${def.hireCost.toLocaleString()}`}
                </button>
            </div>
        `;
    }).join("");

    el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title">👷 MECÁNICOS</div>
            <div class="staff-summary">
                <div class="ss-box"><div class="ss-label">Contratados</div><div class="ss-val">${game.mechanics.length}</div></div>
                <div class="ss-box"><div class="ss-label">Velocidad total</div><div class="ss-val">+${totalSpeed.toFixed(1)}</div></div>
                <div class="ss-box"><div class="ss-label">Salario/min</div><div class="ss-val">$${game.mechanics.reduce((s, m) => s + m.salaryPerMin, 0)}</div></div>
            </div>
        </div>

        <div class="race-card">
            <div class="race-divider">TU EQUIPO</div>
            ${hiredHtml}
        </div>

        <div class="race-card">
            <div class="race-divider">CONTRATAR MECÁNICO</div>
            ${catalogHtml}
        </div>
    `;
}
