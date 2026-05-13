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
                <div class="ps-stat-val">${(game.xp || 0).toLocaleString()}</div>
                <div class="ps-stat-label">XP</div>
            </div>
            <div class="ps-stat-box">
                <div class="ps-stat-val gold">🥇 ${game.medals.gold}</div>
                <div class="ps-stat-label">Victorias</div>
            </div>
            <div class="ps-stat-box">
                <div class="ps-stat-val">🟣 ${game.poleCount || 0}</div>
                <div class="ps-stat-label">Poles</div>
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
            <span>Pack Upgrades +$50K</span><span class="iap-price">$4.99</span>
        </button>
    </div>

    <button class="rbtn" onclick="closeProfileSheet(); showScreen('leaderboard')">🌍 Ranking Global</button>
    <button class="rbtn ad-btn" onclick="AdsManager.offerRewardedAdToGetDiamonds()">📺 Ver anuncio — +2 💎</button>
    <button class="rbtn dash-reset-btn" onclick="resetGame()">🔄 Reiniciar juego</button>

    <!-- Version info -->
    <div class="profile-info-btn-wrap">
        <button class="rbtn profile-info-btn" onclick="showVersionInfo()">ℹ️ Información</button>
    </div>
    `;

    document.getElementById("profileSheet").classList.add("psheet-open");
}

function showVersionInfo() {
    const overlay = document.createElement('div');
    overlay.className = 'ad-overlay';
    overlay.innerHTML = `
    <div class="ad-modal" style="max-width:320px;text-align:center">
        <div style="font-size:32px;margin-bottom:8px">🏎</div>
        <div style="font-size:18px;font-weight:900;color:#fff;margin-bottom:4px">Motorsport Garage Tycoon</div>
        <div style="font-size:13px;color:var(--accent);margin-bottom:12px;font-weight:700">Versión 1.0</div>
        <div style="font-size:11px;color:var(--text-muted);line-height:1.6;margin-bottom:16px">
            Un juego de gestión de garage de carreras.<br>
            Repará autos, corré en ligas, contratá mecánicos<br>
            y dominá el campeonato mundial.<br><br>
            <strong style="color:#fff">Desarrollado con ❤️ para los apasionados del motor.</strong>
        </div>
        <button class="rbtn accent-btn" onclick="this.closest('.ad-overlay').remove()">Cerrar</button>
    </div>`;
    document.body.appendChild(overlay);
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
            <div class="dash-stat-row">📊 <span>XP</span><strong>${(game.xp||0).toLocaleString()}</strong></div>
            <div class="dash-stat-row">🏁 <span>Carreras</span><strong>${game.raceResults.length}</strong></div>
            <div class="dash-stat-row">🥇 <span>Victorias</span><strong>${game.medals.gold}</strong></div>
            <div class="dash-stat-row">🟣 <span>Pole Positions</span><strong>${game.poleCount || 0}</strong></div>
        </div>
    </div>
    <button class="rbtn" onclick="showScreen('leaderboard')">🌍 Ranking Global</button>
    <button class="rbtn ad-btn" onclick="AdsManager.offerRewardedAdToGetDiamonds()">📺 Ver anuncio — +2 💎</button>
    <button class="rbtn dash-reset-btn" onclick="resetGame()">🔄 Reiniciar juego</button>
    <div class="profile-info-btn-wrap">
        <button class="rbtn profile-info-btn" onclick="showVersionInfo()">ℹ️ Información · v1.0</button>
    </div>
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

    el.innerHTML = `<div class="race-card"><div class="race-hero-title">🌍 RANKING GLOBAL</div><div class="lb-loading">Conectando al servidor...</div></div>`;

    let rows = [];
    let connected = false;
    try {
        const res  = await fetch('/api/leaderboard', { signal: AbortSignal.timeout(8000) });
        const json = await res.json();
        if (json.ok) { rows = json.rows; connected = true; }
    } catch (err) {
        console.warn('[leaderboard] No se pudo conectar:', err.message);
    }

    const myDeviceId = CloudSave.getDeviceId();

    if (!connected) {
        el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title">🌍 RANKING GLOBAL</div>
            <div class="lb-offline-banner">
                ⚠️ Sin conexión al servidor<br>
                <small>Jugá en <strong>Replit</strong> para acceder al ranking global. El juego en GitHub Pages es solo local.</small>
            </div>
            <div class="lb-mycard">
                <div style="font-size:13px;font-weight:700;margin-bottom:6px">Tu progreso local:</div>
                <div class="lb-stat-row">📊 Nivel <strong>${game.level}</strong></div>
                <div class="lb-stat-row">🥇 Victorias <strong>${game.medals.gold}</strong></div>
                <div class="lb-stat-row">🟣 Poles <strong>${game.poleCount || 0}</strong></div>
            </div>
        </div>`;
        return;
    }

    if (!rows.length) {
        el.innerHTML = `
        <div class="race-card">
            <div class="race-hero-title">🌍 RANKING GLOBAL</div>
            <div class="lb-subtitle">¡Sé el primero en aparecer!</div>
            <div class="empty-row">Aún no hay jugadores. Completá una carrera y guardá tu perfil.</div>
        </div>`;
        return;
    }

    const rowsHtml = rows.map((r, i) => {
        const medal  = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${r.rank}`;
        const isMe   = r.device_id === myDeviceId;
        const winsByVehicle = [
            r.wins_car     > 0 ? `🚗${r.wins_car}`   : '',
            r.wins_moto    > 0 ? `🏍${r.wins_moto}`  : '',
            r.wins_rally   > 0 ? `🚙${r.wins_rally}` : '',
            r.wins_formula > 0 ? `🏎${r.wins_formula}`: '',
        ].filter(Boolean).join(' ') || '—';

        return `
        <div class="lb-row ${isMe ? 'lb-me' : ''}">
            <div class="lb-rank">${medal}</div>
            <div class="lb-info">
                <div class="lb-name">${escHtml(r.player_name || 'Anónimo')}${isMe ? ' <span class="lb-you-tag">Tú</span>' : ''}</div>
                <div class="lb-garage">${escHtml(r.garage_name || '')}</div>
                <div class="lb-wins-row">${winsByVehicle}</div>
            </div>
            <div class="lb-stats">
                <div class="lb-stat"><span class="lb-sv">Nv.${r.level}</span><small>nivel</small></div>
                <div class="lb-stat"><span class="lb-sv" style="color:var(--text-muted)">${Number(r.xp||0).toLocaleString()}</span><small>XP</small></div>
                <div class="lb-stat"><span class="lb-sv gold">🥇${r.total_wins}</span><small>wins</small></div>
                <div class="lb-stat"><span class="lb-sv" style="color:#b57bee">🟣${r.total_poles||0}</span><small>poles</small></div>
            </div>
        </div>`;
    }).join('');

    el.innerHTML = `
    <div class="race-card">
        <div class="race-hero-title">🌍 RANKING GLOBAL</div>
        <div class="lb-subtitle">Top ${rows.length} jugadores · en tiempo real ☁️</div>
        <div class="lb-list">${rowsHtml}</div>
    </div>`;
}

function escHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ── Init ──────────────────────────────────────────────────────────
async function init() {
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
            if (cloudTs > localTs + 30000) {
                deepMerge(game, cloudData);
                updateGarageHud();
                notifyInfo('☁️ Progreso restaurado desde la nube');
            }
        }
    } catch(_) { /* offline */ }
}

window.addEventListener("DOMContentLoaded", init);
