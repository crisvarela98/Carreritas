// ── Screen routing ────────────────────────────────────────────────
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add("active");

    if (id === "race")        renderRaceScreen();
    if (id === "sponsors")    renderSponsors();
    if (id === "employees")   renderEmployees();
    if (id === "workshop")    renderWorkshop();
    if (id === "profile")     renderProfile();
    if (id === "leaderboard") renderLeaderboard();
    if (id === "dashboard")   updateGarageHud();
}

// ── Garage HUD live update ────────────────────────────────────────
function updateGarageHud() {
    const $ = id => document.getElementById(id);

    const nameEl = $("hudPlayerName");
    if (nameEl) nameEl.textContent = game.playerName || "Jugador";

    const lvEl = $("hudLevel");
    if (lvEl) lvEl.textContent = "Nv." + (game.level || 1);

    const xpFill = $("hudXpFill");
    const xpLabel = $("hudXpLabel");
    const xpMax = (game.level || 1) * 1000;
    const xpCur = game.xp || 0;
    const pct = Math.min(100, (xpCur / xpMax) * 100);
    if (xpFill)  xpFill.style.width = pct + "%";
    if (xpLabel) xpLabel.textContent = xpCur.toLocaleString() + " / " + xpMax.toLocaleString();

    const diaEl = $("hudDiamonds");
    if (diaEl) diaEl.textContent = (game.diamonds || 0).toLocaleString();

    const monEl = $("hudMoney");
    if (monEl) monEl.textContent = "$" + (game.money || 0).toLocaleString();

    const spEl = $("hudSponsorName");
    if (spEl) spEl.textContent = game.sponsor ? game.sponsor.name : "Sponsors";

    updateCarSpots();
    updateFloorSlots();
}

function updateCarSpots() {
    /* car spots removed from dashboard — nothing to update */
}

function updateFloorSlots() {
    const btn = document.getElementById("recieveCarBtn");
    const bar = document.getElementById("rcvBar");
    if (!btn) return;

    const active = (game.workshop && game.workshop.active) || [];
    const queue  = (game.workshop && game.workshop.queue)  || [];
    const allCars = [...active, ...queue];
    const iconEl  = btn.querySelector(".rcv-icon");
    const labelEl = btn.querySelector(".rcv-label");

    btn.classList.remove("rcv-busy", "rcv-done");

    if (allCars.length > 0) {
        const first = allCars[0];
        const pct = first.duration > 0
            ? Math.min(100, Math.floor((first.progress / first.duration) * 100))
            : 0;
        if (pct >= 100) {
            btn.classList.add("rcv-done");
            if (iconEl)  iconEl.textContent  = "✅";
            if (labelEl) labelEl.textContent = "¡Listo!";
            if (bar)     bar.style.width     = "100%";
        } else {
            btn.classList.add("rcv-busy");
            if (iconEl)  iconEl.textContent  = "🔧";
            if (labelEl) labelEl.textContent = allCars.length + " auto" + (allCars.length > 1 ? "s" : "") + " · " + pct + "%";
            if (bar)     bar.style.width     = pct + "%";
        }
    } else {
        if (iconEl)  iconEl.textContent  = "🚗";
        if (labelEl) labelEl.textContent = "Recibir Auto";
        if (bar)     bar.style.width     = "0%";
    }
}

// ── renderDashboard (kept for backward compat) ────────────────────
function renderDashboard() { updateGarageHud(); }

// ── Profile bottom sheet ──────────────────────────────────────────
function openProfileSheet() {
    const body = document.getElementById("profileSheetBody");
    if (!body) return;

    const ownedVehicles = Object.entries(VEHICLE_CATALOG)
        .filter(([id]) => game.vehicles[id]?.owned);

    const leagueRows = ownedVehicles.map(([id, def]) => {
        const rank = LeagueManager.getPlayerRank(id);
        const pts  = LeagueManager.getPlayerPoints(id);
        return `<div class="dash-stat-row">${def.icon} <span>Liga ${def.name}</span><strong>${pts} pts · ${rank}°</strong></div>`;
    }).join("");

    const medalTotal = game.medals.gold + game.medals.silver + game.medals.bronze;

    body.innerHTML = `
    <!-- Edit profile form -->
    <div class="race-card">
        <div class="race-divider">✏️ EDITAR PERFIL</div>
        <label class="profile-label">Tu nombre</label>
        <input class="profile-input" id="psPlayerName" value="${game.playerName || ""}" placeholder="Tu nombre" maxlength="24">
        <label class="profile-label">Nombre del garage</label>
        <input class="profile-input" id="psGarageName" value="${game.garageName || ""}" placeholder="Nombre de tu taller" maxlength="32">
        <button class="rbtn accent-btn" onclick="saveProfileFromSheet()">💾 Guardar</button>
    </div>

    <!-- Stats grid -->
    <div class="race-card">
        <div class="race-divider">📊 ESTADÍSTICAS</div>
        <div class="ps-stat-grid">
            <div class="ps-stat-box">
                <div class="ps-stat-val green">$${game.money.toLocaleString()}</div>
                <div class="ps-stat-label">Monedas</div>
            </div>
            <div class="ps-stat-box">
                <div class="ps-stat-val diam">💎 ${game.diamonds}</div>
                <div class="ps-stat-label">Diamantes</div>
            </div>
            <div class="ps-stat-box">
                <div class="ps-stat-val blue">Nv. ${game.level}</div>
                <div class="ps-stat-label">Nivel</div>
            </div>
            <div class="ps-stat-box">
                <div class="ps-stat-val">${game.reputation}</div>
                <div class="ps-stat-label">Reputación</div>
            </div>
            <div class="ps-stat-box">
                <div class="ps-stat-val gold">🥇 ${game.medals.gold}</div>
                <div class="ps-stat-label">Victorias</div>
            </div>
            <div class="ps-stat-box">
                <div class="ps-stat-val">${game.raceResults.length}</div>
                <div class="ps-stat-label">Carreras</div>
            </div>
        </div>
    </div>

    ${leagueRows.length ? `
    <div class="race-card">
        <div class="race-divider">🏆 LIGAS</div>
        <div class="dash-stats-panel">${leagueRows}</div>
    </div>` : ""}

    <div class="race-card">
        <div class="race-divider">💎 COMPRAR DIAMANTES</div>
        ${Object.entries(IAPManager.PRODUCTS)
            .filter(([, p]) => p.diamonds > 0)
            .map(([id, p]) => `
            <button class="rbtn iap-pack-btn" onclick="IAPManager.purchaseDiamondsPack('${id}')">
                <span>💎 +${p.diamonds}</span><span class="iap-price">${p.price}</span>
            </button>`).join("")}
        <button class="rbtn iap-pack-btn" onclick="IAPManager.purchaseVehicleUpgradePack()">
            <span>Pack Upgrades +$20K</span><span class="iap-price">$4.99</span>
        </button>
    </div>

    <button class="rbtn" onclick="closeProfileSheet(); showScreen('leaderboard')">🌍 Ranking Global</button>
    <button class="rbtn ad-btn" onclick="AdsManager.offerRewardedAdToGetDiamonds()">📺 Ver anuncio — +3 💎</button>
    <button class="rbtn dash-reset-btn" onclick="resetGame()">🔄 Reiniciar juego</button>
    `;

    document.getElementById("profileSheet").classList.add("psheet-open");
}

function closeProfileSheet() {
    const sheet = document.getElementById("profileSheet");
    if (sheet) sheet.classList.remove("psheet-open");
}

function saveProfileFromSheet() {
    const n = document.getElementById("psPlayerName");
    const g = document.getElementById("psGarageName");
    game.playerName = (n && n.value.trim()) || "Jugador";
    game.garageName = (g && g.value.trim()) || "Mi Garage";
    save_user_progress();
    notifySuccess("Perfil guardado ✅");
    updateGarageHud();
    closeProfileSheet();
    if (window.FTUEManager) FTUEManager.onProfileSaved();
}

// ── Profile screen (overlay — kept for direct nav) ────────────────
function renderProfile() {
    const el = document.getElementById("profileContent");
    if (!el) return;

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
        </div>
    </div>
    <button class="rbtn" onclick="showScreen('leaderboard')">🌍 Ranking Global</button>
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
        <div class="pm-tata-row">
            <img src="assets/tata-lion.png" class="pm-tata-img" alt="Tata Lion">
            <div class="pm-tata-speech">
                <div class="pm-speech-from">🦁 Tata Lion</div>
                <div class="pm-speech-text">¡Bienvenido al Team Piston Performance! Soy Tata Lion, el jefe. ¿Cómo te llamas, piloto?</div>
            </div>
        </div>
        <label class="profile-label">Tu nombre</label>
        <input class="profile-input" id="pmPlayerName" placeholder="Ej: Carlos" maxlength="24">
        <label class="profile-label">Nombre de tu garage</label>
        <input class="profile-input" id="pmGarageName" placeholder="Ej: Scuderia Veloz" maxlength="32">
        <button class="rbtn accent-btn pm-start-btn" onclick="submitProfileModal()">🚦 ¡A correr!</button>
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

// ── Leaderboard ───────────────────────────────────────────────────
async function renderLeaderboard() {
    const el = document.getElementById("leaderboardContent");
    if (!el) return;

    el.innerHTML = `<div class="race-card"><div class="race-hero-title">🌍 RANKING GLOBAL</div><div class="lb-loading">Cargando...</div></div>`;

    const rows = await CloudSave.fetchLeaderboard();

    if (!rows.length) {
        el.innerHTML = `<div class="race-card"><div class="race-hero-title">🌍 RANKING GLOBAL</div><div class="empty-row">Aún no hay jugadores en el ranking. ¡Sé el primero!</div></div>`;
        return;
    }

    // Find current player's rank
    const myId = CloudSave.getDeviceId();

    const rowsHtml = rows.map((r, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${r.rank}`;
        const isMe  = (r.device_id === myId);  // not exposed, but rank matches player_name
        return `
        <div class="lb-row ${isMe ? 'lb-me' : ''}">
            <div class="lb-rank">${medal}</div>
            <div class="lb-info">
                <div class="lb-name">${escHtml(r.player_name || 'Anónimo')}</div>
                <div class="lb-garage">${escHtml(r.garage_name || '')}</div>
            </div>
            <div class="lb-stats">
                <div class="lb-stat"><span class="lb-sv">Nv.${r.level}</span><small>nivel</small></div>
                <div class="lb-stat"><span class="lb-sv gold">🥇${r.total_wins}</span><small>wins</small></div>
                <div class="lb-stat"><span class="lb-sv">🔧${Number(r.total_repairs).toLocaleString()}</span><small>rep.</small></div>
            </div>
        </div>`;
    }).join('');

    el.innerHTML = `
    <div class="race-card">
        <div class="race-hero-title">🌍 RANKING GLOBAL</div>
        <div class="lb-subtitle">Top ${rows.length} jugadores · actualizado en tiempo real</div>
        <div class="lb-list">${rowsHtml}</div>
    </div>`;
}

function escHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ── Init ──────────────────────────────────────────────────────────
async function init() {
    load_user_progress();   // immediate localStorage load
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

    setInterval(() => {
        updateGarageHud();
        checkSponsors();
        checkVehicleUnlocks();
    }, 1000);

    startAutoSave();

    // Background cloud load — silently merge if newer
    try {
        const cloudData = await CloudSave.load();
        if (cloudData && typeof cloudData === 'object') {
            const localTs = (() => { try { return JSON.parse(localStorage.getItem('mgt_save_v4') || '{}').timestamp || 0; } catch(_){return 0;} })();
            const cloudTs = cloudData.lastTime || 0;
            if (cloudTs > localTs + 30000) {  // cloud is >30s newer
                deepMerge(game, cloudData);
                updateGarageHud();
                notifyInfo('☁️ Save restaurado desde la nube');
            }
        }
    } catch(_) { /* offline — no problem */ }
}

window.addEventListener("DOMContentLoaded", init);
