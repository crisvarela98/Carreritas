// ── Global game state — single source of truth ───────────────────
const game = {

    // ── USER PROFILE ──────────────────────────────────────────────
    playerName: "",
    garageName: "",

    // ── ECONOMY ───────────────────────────────────────────────────
    money:      1000,   // regular coins
    diamonds:   0,      // premium currency
    reputation: 1,
    xp:         0,
    level:      1,
    lastTime:   Date.now(),

    // ── VEHICLES ─────────────────────────────────────────────────
    // Tracks ownership and per-vehicle upgrade levels
    vehicles: {
        car:     { owned: true,  upgrades: { motor: 1, turbo: 0, brakes: 1, tires: 1, suspension: 1 } },
        moto:    { owned: false, upgrades: { motor: 1, turbo: 0, brakes: 1, tires: 1, suspension: 1 } },
        rally:   { owned: false, upgrades: { motor: 1, turbo: 0, brakes: 1, tires: 1, suspension: 1 } },
        formula: { owned: false, upgrades: { motor: 1, turbo: 0, brakes: 1, tires: 1, suspension: 1 } }
    },

    activeVehicle: "car",   // currently selected vehicle for racing

    // ── WORKSHOP ─────────────────────────────────────────────────
    workshop: {
        level:    1,
        speed:    1,
        capacity: 2,
        queue:    [],
        active:   []
    },

    garageUpgrades: {
        extraBay:   0,  // +1 capacity, max 3
        speedBoost: 0,  // +0.5 speed, max 4
        partsStock: 0   // -10% repair time, max 3
    },

    // ── STAFF ────────────────────────────────────────────────────
    mechanics:  [],
    employees:  [],  // legacy compat

    // ── SPONSORS ─────────────────────────────────────────────────
    sponsor:          null,
    sponsorsUnlocked: [],

    // ── RACE STATS ───────────────────────────────────────────────
    medals:       { gold: 0, silver: 0, bronze: 0 },
    bestLapTimes: {},   // keyed by vehicleId
    poleCount:    0,

    // ── PER-VEHICLE LEAGUES ───────────────────────────────────────
    // THE OLD BUG: league was outside game object → never saved.
    // Now all leagues live here.
    leagues: {
        car:     { standings: [], currentRace: 1 },
        moto:    { standings: [], currentRace: 1 },
        rally:   { standings: [], currentRace: 1 },
        formula: { standings: [], currentRace: 1 }
    },

    // ── RACE HISTORY ─────────────────────────────────────────────
    raceResults: [],    // last 50 races

    // ── FTUE ─────────────────────────────────────────────────────
    ftue: {
        completed: false,
        step: 0     // 0=profile, 1=repair, 2=race, 3=upgrade, 4=done
    },

    // ── IAP OWNERSHIP ────────────────────────────────────────────
    iap: {}
};
