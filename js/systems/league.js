const league = {
    currentRace: 1,
    totalRaces: 10,
    standings: []
};

function initLeague() {
    if (league.standings.length > 0) return;

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
    const pts = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    let entry = league.standings.find(t => t.name === name);
    if (!entry) return;
    entry.points += pts[pos - 1] || 0;
}

function renderLeague() {
    const leagueContent = document.getElementById("leagueContent");
    if (!leagueContent) return;

    let html = `<div class="panel">
        <p>Carrera ${league.currentRace}/${league.totalRaces}</p>
    </div>`;

    league.standings
        .slice()
        .sort((a, b) => b.points - a.points)
        .forEach((t, i) => {
            const highlight = t.name === "Jugador" ? "border-left:4px solid #22c55e;" : "";
            html += `<div class="panel" style="${highlight}">
                ${i + 1}. ${t.name} — ${t.points} pts
            </div>`;
        });

    leagueContent.innerHTML = html;
}
