const league = {
    currentRace: 1,
    totalRaces: 10,
    standings: []
};

function initLeague() {
    league.standings = [];

    for (let i = 0; i < 9; i++) {
        league.standings.push({
            name: "Equipo " + (i + 1),
            points: 0
        });
    }

    league.standings.push({
        name: "Jugador",
        points: 0
    });
}

function awardLeaguePoints(name, pos) {
    const pts = [25,18,15,12,10,8,6,4,2,1];

    let entry = league.standings.find(t => t.name === name);
    entry.points += pts[pos - 1] || 0;
}

function renderLeague() {
    let html = `<div class="panel">
        <p>Carrera ${league.currentRace}/${league.totalRaces}</p>
    </div>`;

    league.standings
        .sort((a,b)=>b.points-a.points)
        .forEach((t,i)=>{
            html += `<div class="panel">
                ${i+1}. ${t.name} - ${t.points} pts
            </div>`;
        });

    leagueContent.innerHTML = html;
}