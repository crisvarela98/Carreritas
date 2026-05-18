const game = {
    money: 1000,
    diamonds: 0,
    reputation: 1,
    level: 1,
    xp: 0,
    playerName: "",
    garageName: "",
    totalPlayTime: 0,
    lastTime: 0,

    workshop: {
        level: 1,
        speed: 1,
        capacity: 2,
        queue: [],
        active: []
    },

    garageUpgrades: {
        extraBay: 0,
        speedBoost: 0,
        partsStock: 0
    },

    vehicles: {
        car:     { owned: true,  upgrades: { motor: 1, turbo: 0, brakes: 1, tires: 1, suspension: 1 } },
        moto:    { owned: false, upgrades: { motor: 1, turbo: 0, brakes: 1, tires: 1, suspension: 1 } },
        rally:   { owned: false, upgrades: { motor: 1, turbo: 0, brakes: 1, tires: 1, suspension: 1 } },
        formula: { owned: false, upgrades: { motor: 1, turbo: 0, brakes: 1, tires: 1, suspension: 1 } }
    },

    leagues: {
        car:     { standings: [], currentRace: 1 },
        moto:    { standings: [], currentRace: 1 },
        rally:   { standings: [], currentRace: 1 },
        formula: { standings: [], currentRace: 1 }
    },

    activeVehicle: "car",

    sponsor: null,
    sponsorsUnlocked: [],

    mechanics: [],
    employees: [],

    stats: {
        totalWins: 0,
        totalRepairs: 0,
        totalPoles: 0,
        wins_car: 0,
        wins_moto: 0,
        wins_rally: 0,
        wins_formula: 0
    },

    medals: { gold: 0, silver: 0, bronze: 0 },
    bestLapTimes: {},
    raceResults: [],

    ftue: { completed: false, step: 0 },
    iap: {}
};
