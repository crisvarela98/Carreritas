// ── Screen routing ────────────────────────────────────────────────
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.querySelectorAll("nav button").forEach(b => b.classList.remove("nav-active"));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add("active");
    const btn = document.querySelector(`nav button[data-screen="${id}"]`);
    if (btn) btn.classList.add("nav-active");

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

    const medalRow = (game.medals.gold + game.medals.silver + game.medals.bronze) > 0
        ? `<div class="dash-medals-row">
               ${game.medals.gold   > 0 ? `<span class="medal gold-m">🥇 ${game.medals.gold}</span>`   : ""}
               ${game.medals.silver > 0 ? `<span class="medal silv-m">🥈 ${game.medals.silver}</span>` : ""}
               ${game.medals.bronze > 0 ? `<span class="medal bron-m">🥉 ${game.medals.bronze}</span>` : ""}
           </div>`
        : "";

    const ownedVehicles = Object.entries(VEHICLE_CATALOG).filter(([id]) => game.vehicles[id]?.owned);
    const leagueRows = ownedVehicles.map(([id, def]) => {
        const rank = LeagueManager.getPlayerRank(id);
        const pts  = LeagueManager.getPlayerPoints(id);
        return `<div class="dash-stat-row">${def.icon} <span>Liga ${def.name}</span><strong>${pts}pts (${rank}°)</strong></div>`;
    }).join("");

    const nextUnlock = Object.entries(VEHICLE_CATALOG).find(([id]) => !game.vehicles[id]?.owned);
    const nextHint   = nextUnlock
        ? `<div class="unlock-hint">🔓 ${nextUnlock[1].icon} ${nextUnlock[1].name} en Nivel ${nextUnlock[1].unlockLevel}</div>`
        : "";

    el.innerHTML = `
    <div class="dash-header">
        <div>
            <div class="dash-title">${game.garageName || "Motorsport Garage Tycoon"}</div>
            ${game.playerName ? `<div class="dash-player-tag">👤 ${game.playerName}</div>` : ""}
        </div>
        <div class="dash-level">Nivel ${game.level}</div>
    </div>

    <div class="dash-currency-row">
        <div class="dash-currency-box">
            <div class="dcb-label">Monedas</div>
            <div class="dcb-val green">$${game.money.toLocaleString()}</div>
        </div>
        <div class="dash-currency-box">
            <div class="dcb-label">Diamantes</div>
            <div class="dcb-val diamond">💎 ${game.diamonds}</div>
        </div>
    </div>

    <div class="dash-xp-bar-wrap">
        <div class="dash-xp-bar" style="width:${Math.min(100,(game.xp/(game.level*1000))*100)}%"></div>
    </div>
    <div class="dash-xp-label">${game.xp} / ${game.level * 1000} XP · Siguiente nivel: +1000💰 +2💎</div>

    ${medalRow}
    ${nextHint}

    <div class="dash-stats-panel">
        <div class="dash-stat-row">🏆 <span>Reputación</span><strong>${game.reputation}</strong></div>
        <div class="dash-stat-row">🔧 <span>Nivel taller</span><strong>${game.workshop.level}</strong></div>
        <div class="dash-stat-row">👷 <span>Mecánicos</span><strong>${game.mechanics.length}</strong></div>
        ${game.sponsor ? `<div class="dash-stat-row">🤝 <span>Sponsor</span><strong>${game.sponsor.name} ×${game.sponsor.money}</strong></div>` : ""}
        ${leagueRows}
    </div>

    <button class="rbtn ad-btn" onclick="AdsManager.offerRewardedAdToGetDiamonds()" style="margin-top:8px">📺 Ver anuncio — +3 💎</button>
    <button class="rbtn dash-reset-btn" onclick="resetGame()">🔄 Reiniciar juego</button>
    `;
}

// ── Profile screen ────────────────────────────────────────────────
function renderProfile() {
    const el = document.getElementById("profileContent");
    if (!el) return;

    const diamondPacks = Object.entries(IAPManager.PRODUCTS)
        .filter(([, p]) => p.diamonds > 0)
        .map(([id, p]) => `
        <button class="rbtn iap-pack-btn" onclick="IAPManager.purchaseDiamondsPack('${id}')">
            <span>💎 +${p.diamonds}</span>
            <span class="iap-price">${p.price}</span>
        </button>`).join("");

    el.innerHTML = `
    <div class="race-card">
        <div class="race-hero-title">👤 MI PERFIL</div>
        <div class="profile-form">
            <label class="profile-label">Nombre del jugador</label>
            <input class="profile-input" id="inputPlayerName" value="${game.playerName || ""}" placeholder="Tu nombre" maxlength="24">
            <label class="profile-label">Nombre del garage</label>
            <input class="profile-input" id="inputGarageName" value="${game.garageName || ""}" placeholder="Nombre de tu taller" maxlength="32">
            <button class="rbtn accent-btn" onclick="saveProfile()">💾 Guardar perfil</button>
        </div>
    </div>

    <div class="race-card">
        <div class="race-divider">ESTADÍSTICAS</div>
        <div class="dash-stats-panel" style="border-radius:10px">
            <div class="dash-stat-row">💰 <span>Monedas</span><strong>$${game.money.toLocaleString()}</strong></div>
            <div class="dash-stat-row">💎 <span>Diamantes</span><strong>${game.diamonds}</strong></div>
            <div class="dash-stat-row">⭐ <span>Nivel</span><strong>${game.level}</strong></div>
            <div class="dash-stat-row">🏁 <span>Carreras</span><strong>${game.raceResults.length}</strong></div>
            <div class="dash-stat-row">🥇 <span>Victorias</span><strong>${game.medals.gold}</strong></div>
            <div class="dash-stat-row">🟣 <span>Poles</span><strong>${game.poleCount}</strong></div>
        </div>
    </div>

    <div class="race-card">
        <div class="race-divider">💎 COMPRAR DIAMANTES</div>
        ${diamondPacks}
        <button class="rbtn iap-pack-btn" onclick="IAPManager.purchaseVehicleUpgradePack()">
            <span>Pack Upgrades +$20K</span><span class="iap-price">$4.99</span>
        </button>
    </div>`;
}

function saveProfile() {
    const nameEl   = document.getElementById("inputPlayerName");
    const garageEl = document.getElementById("inputGarageName");
    game.playerName = (nameEl   && nameEl.value.trim())  || "Jugador";
    game.garageName = (garageEl && garageEl.value.trim()) || "Mi Garage";
    save_user_progress();
    notifySuccess("Perfil guardado ✅");
    renderDashboard();
    if (window.FTUEManager) FTUEManager.onProfileSaved();
}

// ── First-run profile modal ───────────────────────────────────────
function showProfileModal() {
    if (game.playerName) return;
    const overlay = document.createElement("div");
    overlay.id        = "profileModal";
    overlay.className = "profile-modal-overlay";
    overlay.innerHTML = `
    <div class="profile-modal">
        <div class="pm-title">🏎 Motorsport Garage Tycoon</div>
        <div class="pm-subtitle">¡Bienvenido! Configura tu taller para comenzar.</div>
        <label class="profile-label">Tu nombre</label>
        <input class="profile-input" id="pmPlayerName" placeholder="Ej: Carlos" maxlength="24">
        <label class="profile-label">Nombre de tu garage</label>
        <input class="profile-input" id="pmGarageName" placeholder="Ej: Scuderia Veloz" maxlength="32">
        <button class="rbtn accent-btn pm-start-btn" onclick="submitProfileModal()">🚦 ¡Comenzar!</button>
    </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => { const i = document.getElementById("pmPlayerName"); if (i) i.focus(); }, 100);
}

function submitProfileModal() {
    const n = document.getElementById("pmPlayerName");
    const g = document.getElementById("pmGarageName");
    game.playerName = (n && n.value.trim()) || "Jugador";
    game.garageName = (g && g.value.trim()) || "Mi Garage";
    const overlay = document.getElementById("profileModal");
    if (overlay) overlay.remove();
    save_user_progress();
    renderDashboard();
    if (window.FTUEManager) FTUEManager.onProfileSaved();
}

// ── Init ──────────────────────────────────────────────────────────
function init() {
    load_user_progress();
    applyOffline();
    initAllLeagues();
    checkVehicleUnlocks();

    renderDashboard();
    renderWorkshop();
    renderEmployees();
    renderSponsors();
    renderLeague();
    renderRaceScreen();

    if (window.FTUEManager) FTUEManager.init();
    if (!game.playerName) showProfileModal();

    setInterval(() => {
        renderDashboard();
        checkSponsors();
        checkVehicleUnlocks();
    }, 1000);

    startAutoSave();
}

window.addEventListener("DOMContentLoaded", init);
