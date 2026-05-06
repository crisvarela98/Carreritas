// ===== ELEMENTOS HTML =====
const dashboardContent = document.getElementById("dashboardContent");
const workshopContent = document.getElementById("workshopContent");
const employeesContent = document.getElementById("employeesContent");
const sponsorsContent = document.getElementById("sponsorsContent");
const leagueContent = document.getElementById("leagueContent");
const notifications = document.getElementById("notifications");

// ===== CAMBIO DE PANTALLA =====
function showScreen(id) {

    document.querySelectorAll(".screen")
        .forEach(screen => screen.classList.remove("active"));

    document.getElementById(id).classList.add("active");
}

// ===== DASHBOARD =====
function renderDashboard() {

    dashboardContent.innerHTML = `
        <div class="panel">
            <h3>Empresa</h3>

            <p>💰 Dinero: $${game.money}</p>
            <p>⭐ Nivel: ${game.level}</p>
            <p>🏆 Reputación: ${game.reputation}</p>
            <p>📈 XP: ${game.xp}</p>

            <p>
                🤝 Sponsor:
                ${game.sponsor ? game.sponsor.name : "Ninguno"}
            </p>
        </div>
    `;
}

// ===== INICIALIZACIÓN =====
window.onload = () => {

    // cargar guardado
    loadGame();

    // progreso offline
    applyOffline();

    // iniciar liga
    initLeague();

    // render inicial
    renderDashboard();
    renderWorkshop();
    renderEmployees();
    renderSponsors();
    renderLeague();

    // autosave
    startAutoSave();

    // refresco UI
    setInterval(() => {
        renderDashboard();
    }, 1000);
};