// ── Vehicle Catalog ───────────────────────────────────────────────

const VEHICLE_CATALOG = {
    car: {
        id:           "car",
        name:         "Auto de Taller",
        icon:         "🚗",
        color:        "#3b82f6",
        unlockLevel:  1,
        leagueId:     "car",
        basePace:     92,       // seconds per lap (lower = faster)
        baseStats:    { hp: 350, torque: 476, cv: 355 },
        lapLabel:     "Vuelta",
        totalLaps:    5,
        desc:         "El punto de partida. Versátil y fácil de mejorar."
    },
    moto: {
        id:           "moto",
        name:         "Moto de Carreras",
        icon:         "🏍",
        color:        "#f97316",
        unlockLevel:  15,
        leagueId:     "moto",
        basePace:     65,
        baseStats:    { hp: 200, torque: 120, cv: 203 },
        lapLabel:     "Vuelta",
        totalLaps:    5,
        desc:         "Rápida y ágil. Requiere precisión en cada curva."
    },
    rally: {
        id:           "rally",
        name:         "Camioneta Rally",
        icon:         "🚙",
        color:        "#22c55e",
        unlockLevel:  30,
        leagueId:     "rally",
        basePace:     105,
        baseStats:    { hp: 450, torque: 610, cv: 456 },
        lapLabel:     "Etapa",
        totalLaps:    5,
        desc:         "Potencia bruta en terreno agreste. La bestia del off-road."
    },
    formula: {
        id:           "formula",
        name:         "Monoplaza Fórmula",
        icon:         "🏎",
        color:        "#e11d48",
        unlockLevel:  50,
        leagueId:     "formula",
        basePace:     80,
        baseStats:    { hp: 1000, torque: 400, cv: 1014 },
        lapLabel:     "Vuelta",
        totalLaps:    7,
        desc:         "La cúspide del automovilismo. La liga más competitiva."
    }
};

// ── Rivals per vehicle type ───────────────────────────────────────
const VEHICLE_RIVALS = {
    car: [
        { name: "Hamilton",   basePace: 82 },
        { name: "Verstappen", basePace: 81 },
        { name: "Leclerc",    basePace: 83 },
        { name: "Norris",     basePace: 84 },
        { name: "Sainz",      basePace: 85 },
        { name: "Russell",    basePace: 84 },
        { name: "Alonso",     basePace: 86 },
        { name: "Pérez",      basePace: 86 },
    ],
    moto: [
        { name: "Márquez",    basePace: 54 },
        { name: "Bagnaia",    basePace: 55 },
        { name: "Quartararo", basePace: 56 },
        { name: "Binder",     basePace: 57 },
        { name: "Viñales",    basePace: 57 },
        { name: "Zarco",      basePace: 58 },
        { name: "Miller",     basePace: 58 },
        { name: "Bastianini", basePace: 56 },
    ],
    rally: [
        { name: "Ogier",       basePace: 95 },
        { name: "Loeb",        basePace: 96 },
        { name: "Evans",       basePace: 97 },
        { name: "Neuville",    basePace: 96 },
        { name: "Rovanperä",   basePace: 95 },
        { name: "Fourmaux",    basePace: 98 },
        { name: "Lappi",       basePace: 98 },
        { name: "Solberg",     basePace: 99 },
    ],
    formula: [
        { name: "Hamilton",    basePace: 68 },
        { name: "Verstappen",  basePace: 67 },
        { name: "Leclerc",     basePace: 69 },
        { name: "Senna",       basePace: 68 },
        { name: "Schumacher",  basePace: 70 },
        { name: "Prost",       basePace: 69 },
        { name: "Norris",      basePace: 70 },
        { name: "Piastri",     basePace: 71 },
    ]
};

// ── Computed stats (base + upgrade bonuses) ───────────────────────
function getVehicleStats(vehicleId) {
    const def  = VEHICLE_CATALOG[vehicleId];
    const veh  = game.vehicles[vehicleId];
    if (!def || !veh) return null;

    const up = veh.upgrades;
    const motorLvl      = up.motor      || 0;
    const turboLvl      = up.turbo      || 0;
    const brakesLvl     = up.brakes     || 0;
    const tiresLvl      = up.tires      || 0;
    const suspensionLvl = up.suspension || 0;

    const hpMult  = 1 + (motorLvl - 1) * 0.15 + turboLvl * 0.12;
    const tqMult  = 1 + (motorLvl - 1) * 0.12 + turboLvl * 0.08 + suspensionLvl * 0.03;
    const cvMult  = hpMult;

    return {
        hp:     Math.round(def.baseStats.hp     * hpMult),
        torque: Math.round(def.baseStats.torque * tqMult),
        cv:     Math.round(def.baseStats.cv     * cvMult),
        motor:      motorLvl,
        turbo:      turboLvl,
        brakes:     brakesLvl,
        tires:      tiresLvl,
        suspension: suspensionLvl
    };
}

// ── Race pace calculation ─────────────────────────────────────────
function getVehiclePace(vehicleId) {
    const def  = VEHICLE_CATALOG[vehicleId];
    const veh  = game.vehicles[vehicleId];
    if (!def || !veh) return 999;

    const up       = veh.upgrades;
    const base     = def.basePace;

    // Part bonuses (seconds reduction per lap)
    const motorBonus      = ((up.motor      || 1) - 1) * 2.0;
    const turboBonus      = (up.turbo       || 0) * 1.5;
    const brakesBonus     = ((up.brakes     || 1) - 1) * 0.8;
    const tiresBonus      = ((up.tires      || 1) - 1) * 1.2;
    const suspensionBonus = ((up.suspension || 1) - 1) * 0.6;

    // Other bonuses
    const repBonus     = Math.min(game.reputation * 0.05, 5);
    const sponsorBonus = game.sponsor ? 1 : 0;
    const mechBonus    = Math.min(getTotalMechanicSpeed() * 0.3, 3);

    const total = motorBonus + turboBonus + brakesBonus + tiresBonus + suspensionBonus + repBonus + sponsorBonus + mechBonus;
    return Math.max(def.basePace * 0.4, base - total);
}

// ── Unlock logic ─────────────────────────────────────────────────
function unlockVehicle(vehicleId) {
    if (!game.vehicles[vehicleId]) return;
    game.vehicles[vehicleId].owned = true;
    notifySuccess(`¡${VEHICLE_CATALOG[vehicleId].icon} ${VEHICLE_CATALOG[vehicleId].name} desbloqueado!`);
    if (window.LeagueManager) LeagueManager.init(vehicleId);
}

function checkVehicleUnlocks() {
    for (const [id, def] of Object.entries(VEHICLE_CATALOG)) {
        if (!game.vehicles[id].owned && game.level >= def.unlockLevel) {
            unlockVehicle(id);
        }
    }
}

function formatLapTime(secs) {
    const m   = Math.floor(secs / 60);
    const rem = secs % 60;
    const s   = rem < 10 ? "0" + rem.toFixed(3) : rem.toFixed(3);
    return `${m}:${s}`;
}
