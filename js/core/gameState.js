// ── Global game state — single source of truth ───────────────────
const game = {
    money: 1000,
    reputation: 1,

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

    championship: {
        round: 1,
        totalRounds: 10,
        points: 0
    },

    rivals: []
};