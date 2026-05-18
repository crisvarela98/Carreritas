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

    if (typeof tryAdvanceFtue === "function") {
        tryAdvanceFtue(3);
    }
}

function renderEmployees(){
    employeesContent.innerHTML=`
    <div class="panel">
        Empleados: ${game.employees.length}
        <button onclick="hireEmployee()">Contratar</button>
    </div>`;
}
