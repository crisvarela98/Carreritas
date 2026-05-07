// ── Screen routing ────────────────────────────────────────────────
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.querySelectorAll("nav button").forEach(b => b.classList.remove("nav-active"));

    const screen = document.getElementById(id);
    if (screen) screen.classList.add("active");

    const navBtn = document.querySelector(`nav button[data-screen="${id}"]`);
    if (navBtn) navBtn.classList.add("nav-active");

    if (id === "race")      renderRaceScreen();
    if (id === "league")    renderLeague();
    if (id === "sponsors")  renderSponsors();
    if (id === "employees") renderEmployees();
    if (id === "workshop")  renderWorkshop();
    if (id === "profile")   renderProfile();
}

// ── Dashboard ─────────────────────────────────────────────────────
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
               ${game.medals.gold   > 0 ? `<span class="medal gold-m">🥇 ${game.medals.gold}</span>`   : ""}
               ${game.medals.silver > 0 ? `<span class="medal silv-m">🥈 ${game.medals.silver}</span>` : ""}
               ${game.medals.bronze > 0 ? `<span class="medal bron-m">🥉 ${game.medals.bronze}</span>` : ""}
           </div>`
        : "";

    const leagueEntry = game.league.standings.find(t => t.name === "Jugador");
    const leaguePoints = leagueEntry ? leagueEntry.points : 0;
    const leagueRank   = calculate_league_points().findIndex(t => t.name === "Jugador") + 1;

    const playerTag = game.playerName
        ? `<div class="dash-player-tag">👤 ${game.playerName}  ·  🏠 ${game.garageName || "Mi Garage"}</div>`
        : "";

    el.innerHTML = `
        <div class="dash-header">
            <div class="dash-title">Motorsport Garage Tycoon</div>
            <div class="dash-level">Nivel ${game.level}</div>
        </div>

        ${playerTag}

        <div class="dash-money">$${game.money.toLocaleString()}</div>
        <div class="dash-xp-bar-wrap">
            <div class="dash-xp-bar" style="width:${Math.min(100,(game.xp/(game.level*1000))*100)}%"></div>
        </div>
        <div class="dash-xp-label">${game.xp} / ${game.level * 1000} XP</div>

        ${medalRow}

        <div class="dash-stats-panel">
            <div class="dash-stat-row">🏆 <span>Reputación</span><strong>${game.reputation}</strong></div>
            <div class="dash-stat-row">🔧 <span>Nivel taller</span><strong>${game.workshop.level}</strong></div>
            <div class="dash-stat-row">👷 <span>Mecánicos</span><strong>${game.mechanics.length}</strong></div>
            <div class="dash-stat-row">🏁 <span>Puntos de liga</span><strong>${leaguePoints} pts (${leagueRank}°)</strong></div>
            ${game.sponsor ? `<div class="dash-stat-row">🤝 <span>Sponsor</span><strong>${game.sponsor.name}</strong></div>` : ""}
            ${best}
            ${poleRow}
        </div>

        <button class="rbtn dash-reset-btn" onclick="resetGame()">🔄 Reiniciar juego</button>
    `;
}

// ── Profile screen ────────────────────────────────────────────────
function renderProfile() {
    const el = document.getElementById("profileContent");
    if (!el) return;

    el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title">👤 MI PERFIL</div>
            <div class="profile-form">
                <label class="profile-label">Nombre del jugador</label>
                <input class="profile-input" id="inputPlayerName"
                       value="${game.playerName || ""}" placeholder="Tu nombre" maxlength="24">

                <label class="profile-label">Nombre del garage</label>
                <input class="profile-input" id="inputGarageName"
                       value="${game.garageName || ""}" placeholder="Nombre de tu taller" maxlength="32">

                <button class="rbtn accent-btn" onclick="saveProfile()">💾 Guardar perfil</button>
            </div>
        </div>

        <div class="race-card">
            <div class="race-divider">ESTADÍSTICAS</div>
            <div class="dash-stats-panel" style="border-radius:10px">
                <div class="dash-stat-row">💰 <span>Dinero total</span><strong>$${game.money.toLocaleString()}</strong></div>
                <div class="dash-stat-row">⭐ <span>Nivel</span><strong>${game.level}</strong></div>
                <div class="dash-stat-row">🏆 <span>Reputación</span><strong>${game.reputation}</strong></div>
                <div class="dash-stat-row">🏁 <span>Carreras disputadas</span><strong>${game.raceResults.length}</strong></div>
                <div class="dash-stat-row">🥇 <span>Victorias</span><strong>${game.medals.gold}</strong></div>
                <div class="dash-stat-row">🟣 <span>Poles</span><strong>${game.poleCount}</strong></div>
            </div>
        </div>
    `;
}

function saveProfile() {
    const nameEl   = document.getElementById("inputPlayerName");
    const garageEl = document.getElementById("inputGarageName");

    const name   = (nameEl   ? nameEl.value.trim()   : "") || "Jugador";
    const garage = (garageEl ? garageEl.value.trim()  : "") || "Mi Garage";

    game.playerName  = name;
    game.garageName  = garage;

    save_user_progress();
    notify("Perfil guardado ✅", "success");

    // Update league entry name display
    renderLeague();
    renderDashboard();

    // FTUE
    if (window.FTUEManager) FTUEManager.onProfileSaved();
}

// ── Profile setup modal (first-run FTUE step 0) ───────────────────
function showProfileModal() {
    if (game.playerName) return; // already set

    const overlay = document.createElement("div");
    overlay.id        = "profileModal";
    overlay.className = "profile-modal-overlay";
    overlay.innerHTML = `
        <div class="profile-modal">
            <div class="pm-title">🏎 Motorsport Garage Tycoon</div>
            <div class="pm-subtitle">¡Bienvenido! Configura tu taller para comenzar.</div>

            <label class="profile-label">Tu nombre</label>
            <input class="profile-input" id="pmPlayerName" placeholder="Ej: Carlos" maxlength="24" autofocus>

            <label class="profile-label">Nombre de tu garage</label>
            <input class="profile-input" id="pmGarageName" placeholder="Ej: Scuderia Veloz" maxlength="32">

            <button class="rbtn accent-btn pm-start-btn" onclick="submitProfileModal()">🚦 ¡Comenzar!</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Focus first input
    setTimeout(() => {
        const inp = document.getElementById("pmPlayerName");
        if (inp) inp.focus();
    }, 100);
}

function submitProfileModal() {
    const nameEl   = document.getElementById("pmPlayerName");
    const garageEl = document.getElementById("pmGarageName");

    game.playerName = (nameEl   && nameEl.value.trim())   || "Jugador";
    game.garageName = (garageEl && garageEl.value.trim())  || "Mi Garage";

    const overlay = document.getElementById("profileModal");
    if (overlay) overlay.remove();

    save_user_progress();
    renderDashboard();

    if (window.FTUEManager) {
        FTUEManager.onProfileSaved();
    }
}

// ── Init ──────────────────────────────────────────────────────────
function init() {
    load_user_progress();
    applyOffline();
    initLeague();

    renderDashboard();
    renderWorkshop();
    renderEmployees();
    renderSponsors();
    renderLeague();
    renderRaceScreen();

    // FTUE
    if (window.FTUEManager) FTUEManager.init();

    // Show profile modal on first run
    if (!game.playerName) {
        showProfileModal();
    }

    setInterval(() => {
        renderDashboard();
        checkSponsors();
    }, 1000);

    startAutoSave();
}

window.addEventListener("DOMContentLoaded", init);
