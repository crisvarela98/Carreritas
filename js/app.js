function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function renderDashboard() {
    const dashboardContent = document.getElementById("dashboardContent");
    dashboardContent.innerHTML = `
        <div class="panel">
            <h3>Garage Tycoon</h3>
            <p>💰 Dinero: $${game.money}</p>
            <p>⭐ Nivel: ${game.level} (XP: ${game.xp})</p>
            <p>🏆 Reputación: ${game.reputation}</p>
            <p>🔧 Nivel de taller: ${game.workshop.level}</p>
            ${game.sponsor ? `<p>🤝 Sponsor: ${game.sponsor.name}</p>` : ''}
            <button onclick="resetGame()" style="margin-top:1rem;background:#c00;">Reiniciar juego</button>
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

    setInterval(() => {
        renderDashboard();
        checkSponsors();
    }, 1000);

    startAutoSave();
}

window.addEventListener('DOMContentLoaded', init);
