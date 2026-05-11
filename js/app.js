// ── Screen routing ────────────────────────────────────────────────
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add("active");

    if (id === "race")      renderRaceScreen();
    if (id === "sponsors")  renderSponsors();
    if (id === "employees") renderEmployees();
    if (id === "workshop")  renderWorkshop();
    if (id === "profile")   renderProfile();
    if (id === "dashboard") updateGarageHud();
}

// ── Garage HUD live update ────────────────────────────────────────
function updateGarageHud() {
    const el = (id) => document.getElementById(id);

    // Player name
    const nameEl = el("hudPlayerName");
    if (nameEl) nameEl.textContent = game.playerName || "Jugador";

    // Level badge
    const lvEl = el("hudLevel");
    if (lvEl) lvEl.textContent = "Nv." + (game.level || 1);

    // XP bar
    const xpFill = el("hudXpFill");
    if (xpFill) {
        const pct = Math.min(100, ((game.xp || 0) / ((game.level || 1) * 1000)) * 100);
        xpFill.style.width = pct + "%";
    }

    // Diamonds
    const diaEl = el("hudDiamonds");
    if (diaEl) diaEl.textContent = game.diamonds || 0;

    // Money
    const monEl = el("hudMoney");
    if (monEl) monEl.textContent = "$" + (game.money || 0).toLocaleString();

    // Sponsor button label
    const spEl = el("hudSponsorName");
    if (spEl) spEl.textContent = game.sponsor ? game.sponsor.name : "Sponsors";

    // Update car spots (show owned vehicles)
    updateCarSpots();

    // Update floor slots (workshop state)
    updateFloorSlots();
}

function updateCarSpots() {
    const spotMap = {
        "gspot-car":   "car",
        "gspot-moto":  "moto",
        "gspot-rally": "rally",
        "gspot-f1":    "f1"
    };
    for (const [spotId, vehicleId] of Object.entries(spotMap)) {
        const el = document.getElementById(spotId);
        if (!el) continue;
        const owned = game.vehicles && game.vehicles[vehicleId] && game.vehicles[vehicleId].owned;
        if (owned) {
            el.classList.remove("spot-locked");
        } else {
            el.classList.add("spot-locked");
        }
    }
}

function updateFloorSlots() {
    const active = (game.workshop && game.workshop.active) || [];
    const queue  = (game.workshop && game.workshop.queue)  || [];
    const allCars = [...active, ...queue];

    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById("gslot-" + i);
        if (!el) continue;
        const car = allCars[i - 1];
        el.classList.remove("slot-busy", "slot-done");
        if (car) {
            if (car.progress >= 100) {
                el.classList.add("slot-done");
            } else {
                el.classList.add("slot-busy");
            }
            // Show progress % in slot
            const span = el.querySelector("span");
            if (span) span.textContent = Math.floor(car.progress || 0) + "%";
        } else {
            const span = el.querySelector("span");
            if (span) span.textContent = i;
        }
    }
}

// ── Dashboard (legacy renderDashboard kept for compatibility) ──────
function renderDashboard() {
    updateGarageHud();
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
    </div>

    <button class="rbtn ad-btn" onclick="AdsManager.offerRewardedAdToGetDiamonds()">📺 Ver anuncio — +3 💎</button>
    <button class="rbtn dash-reset-btn" onclick="resetGame()">🔄 Reiniciar juego</button>
    `;
}

function saveProfile() {
    const nameEl   = document.getElementById("inputPlayerName");
    const garageEl = document.getElementById("inputGarageName");
    game.playerName = (nameEl   && nameEl.value.trim())  || "Jugador";
    game.garageName = (garageEl && garageEl.value.trim()) || "Mi Garage";
    save_user_progress();
    notifySuccess("Perfil guardado ✅");
    updateGarageHud();
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
    updateGarageHud();
    if (window.FTUEManager) FTUEManager.onProfileSaved();
}

// ── Init ──────────────────────────────────────────────────────────
function init() {
    load_user_progress();
    applyOffline();
    initAllLeagues();
    checkVehicleUnlocks();

    updateGarageHud();
    renderWorkshop();
    renderEmployees();
    renderSponsors();
    renderRaceScreen();

    if (window.FTUEManager) FTUEManager.init();
    if (window.TaskManager) TaskManager.init();
    if (!game.playerName) showProfileModal();

    // Live HUD refresh every second
    setInterval(() => {
        updateGarageHud();
        checkSponsors();
        checkVehicleUnlocks();
    }, 1000);

    startAutoSave();
}

window.addEventListener("DOMContentLoaded", init);
