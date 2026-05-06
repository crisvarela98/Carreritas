function runRace() {

    let playerBase =
        game.workshop.level +
        game.reputation +
        (game.sponsor ? game.sponsor.money : 1);

    let results = [
        { name: "Jugador", power: playerBase }
    ];

    league.standings.forEach(t => {
        if (t.name !== "Jugador") {
            results.push({
                name: t.name,
                power: Math.random()*10 + 5
            });
        }
    });

    results.sort((a,b)=>b.power-a.power);

    let pos = results.findIndex(r => r.name === "Jugador") + 1;

    // recompensas
    let reward = (11-pos)*100;
    game.money += reward;

    addXP(150);

    // puntos liga
    results.forEach((r,i)=>{
        awardLeaguePoints(r.name, i+1);
    });

    notify("Terminaste " + pos + "° | $" + reward);

    league.currentRace++;

    renderLeague();
}