const game = {
    money: 1000,
    reputation: 1,
    xp: 0,
    level: 1,
    lastTime: Date.now(),

    car: {
        engine: 1,
        aero: 1,
        durability: 1
    },

    driver: {
        name: "Jugador",
        skill: 1,
        salary: 100
    },

    sponsor: null,
    sponsorsUnlocked: [],

    workshop: {
        level: 1,
        speed: 1,
        capacity: 2,
        queue: [],
        active: []
    },

    employees: [],

    championship: {
        round: 1,
        totalRounds: 10,
        points: 0
    },

    rivals: []
};
