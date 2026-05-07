function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    if (id === "race") renderRaceScreen();
    if (id === "league") renderLeague();
    if (id === "sponsors") renderSponsors();
    if (id === "employees") renderEmployees();
    if (id === "workshop") renderWorkshop();
}

function renderDashboard() {
    const el = document.getElementById("dashboardContent");
    if (!el) return;

    const best = game.bestLapTime
        ? `<div class="dash-stat-row">⚡ <span>Mejor vuelta</span><strong>${formatLapTime(game.bestLapTime)}</strong></div>`
        : "";

    const poleRow = game.poleCount > 0
        ? `<div class="dash-stat-row">🟣 <span>Poles</span><strong>${game.poleCount}</strong></div>`
        : "";

    const medalRow = (game.medals.gold + game.medals.silver + game.medals.bronze) > 0
        ? `<div class="dash-medals-row">
               ${game.medals.gold   > 0 ? `<span class="medal gold-m">🥇 ${game.medals.gold}</span>` : ""}
               ${game.medals.silver > 0 ? `<span class="medal silv-m">🥈 ${game.medals.silver}</span>` : ""}
               ${game.medals.bronze > 0 ? `<span class="medal bron-m">🥉 ${game.medals.bronze}</span>` : ""}
           </div>`
        : "";

    el.innerHTML = `
        <div class="dash-header">
            <div class="dash-title">Motorsport Garage Tycoon</div>
            <div class="dash-level">Nivel ${game.level}</div>
        </div>

        <div class="dash-money">$${game.money.toLocaleString()}</div>
        <div class="dash-xp-bar-wrap">
            <div class="dash-xp-bar" style="width:${Math.min(100,(game.xp/(game.level*1000))*100)}%"></div>
        </div>
        <div class="dash-xp-label">${game.xp} / ${game.level * 1000} XP</div>

        ${medalRow}

        <div class="dash-stats-panel">
            <div class="dash-stat-row">🏆 <span>Reputación</span><strong>${game.reputation}</strong></div>
            <div class="dash-stat-row">🔧 <span>Nivel taller</span><strong>${game.workshop.level}</strong></div>
            <div class="dash-stat-row">👷 <span>Empleados</span><strong>${game.employees.length}</strong></div>
            ${game.sponsor ? `<div class="dash-stat-row">🤝 <span>Sponsor</span><strong>${game.sponsor.name}</strong></div>` : ""}
            ${best}
            ${poleRow}
        </div>

    `;
}

function init() {
    loadGame();
    applyOffline();
    initLeague();
    renderDashboard();
    renderWorkshop();
    renderEmployees();
    renderSponsors();
    renderLeague();
    renderRaceScreen();

    setInterval(() => {
        renderDashboard();
        checkSponsors();
    }, 1000);

    startAutoSave();
}

window.addEventListener("DOMContentLoaded", init);
