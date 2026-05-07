const game = {

    // ── USER PROFILE ──────────────────────────────────────────────
    playerName: "",
    garageName: "",

    // ── CORE ECONOMY ──────────────────────────────────────────────
    money: 1000,
    reputation: 1,
    xp: 0,
    level: 1,
    lastTime: Date.now(),

    // ── RACE CAR ──────────────────────────────────────────────────
    car: {
        engine: 1,
        transmission: 1,
        aero: 1,
        wheels: 1
    },

    driver: { name: "Jugador", skill: 1, salary: 100 },

    // ── SPONSORS ──────────────────────────────────────────────────
    sponsor: null,
    sponsorsUnlocked: [],

    // ── WORKSHOP / GARAGE ─────────────────────────────────────────
    workshop: {
        level: 1,
        speed: 1,
        capacity: 2,
        queue: [],
        active: []
    },

    // Purchasable garage upgrades
    garageUpgrades: {
        extraBay: 0,      // +1 capacity per level, max 3
        speedBoost: 0,    // +0.5 speed per level, max 4
        partsStock: 0     // -10% repair duration per level, max 3
    },

    // ── MECHANICS (NPC STAFF) ─────────────────────────────────────
    mechanics: [],
    // each entry: { id, name, speed, hireCost, salaryPerMin }

    // Legacy employees array (kept for save compatibility)
    employees: [],

    // ── RACE STATS ────────────────────────────────────────────────
    medals: { gold: 0, silver: 0, bronze: 0 },
    bestLapTime: null,
    poleCount: 0,

    // ── LEAGUE (persisted inside game — this was the bug) ─────────
    league: {
        currentRace: 1,
        totalRaces: 10,
        standings: []
        // each entry: { name, points }
    },

    // ── RACE HISTORY ──────────────────────────────────────────────
    raceResults: [],
    // each entry: { position, moneyEarned, xpEarned, leaguePoints, timestamp }

    // ── FTUE PROGRESS ─────────────────────────────────────────────
    ftue: {
        completed: false,
        step: 0
        // steps: 0=profile, 1=repair_first, 2=finish_repair,
        //        3=upgrade_car, 4=hire_mechanic, 5=run_race, 6=done
    }
};
