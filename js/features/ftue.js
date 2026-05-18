// ── FTUE v2 — Arrow-guided tutorial, name asked AFTER playing ─────
// Flow: auto-start on first run (step 0→1 immediately, no name needed)
// Step 1: Receive a car (→ #recieveCarBtn)
// Step 2: Run a race (→ .lfab-carrera)
// Step 3: Hire a mechanic (→ #staffSheetBtn / openStaffSheet)
// Step 4: Play minigame (→ truck rfab button)
// Step 5: Name modal shown → on save → mark complete

const FTUEManager = (() => {

    // ── Step definitions ──────────────────────────────────────────
    const STEPS = [
        {
            step:    1,
            msg:     "🚗 Tocá el auto para recibir tu primer cliente",
            sub:     "Cada reparación te da dinero y experiencia.",
            target:  "#recieveCarBtn",
            arrowDir: "down",
            dots:    [true, false, false, false]
        },
        {
            step:    2,
            msg:     "🏁 Corré tu primera carrera",
            sub:     "Tocá el botón Carrera y elegí tu vehículo.",
            target:  ".lfab-carrera",
            arrowDir: "down",
            dots:    [true, true, false, false]
        },
        {
            step:    3,
            msg:     "👨‍🔧 Contratá un mecánico",
            sub:     "Los mecánicos reparan autos automáticamente. Un Junior cuesta $600.",
            target:  ".hud-staff-btn",
            arrowDir: "up",
            dots:    [true, true, true, false]
        },
        {
            step:    4,
            msg:     "🚛 Jugá el camión ciudad",
            sub:     "Esquivá el tráfico y ganás $150 por segundo. ¡Es la forma más rápida de conseguir dinero!",
            target:  "#tataFloatBtn",
            arrowDir: "right",
            dots:    [true, true, true, true]
        }
    ];

    // Level tips shown after FTUE is done
    const LEVEL_TIPS = {
        5:  { title: '¡Conseguí un sponsor!',     hint: 'Tocá 💰 Sponsors arriba. Un sponsor te da más dinero en cada carrera.' },
        10: { title: '¡Mejorá el taller!',         hint: 'Tocá 🔧 Taller → Garage. Las Herramientas Pro aceleran reparaciones.' },
        15: { title: '¡Moto desbloqueada pronto!', hint: 'Al nivel 15 desbloqueás la Moto de Carreras. Empezá a ahorrar.' },
        20: { title: '¡Completá tus tareas!',       hint: 'Tocá 🎯 arriba a la derecha. Las tareas diarias te dan XP gratis.' },
    };

    const VEHICLE_TIPS = {
        moto:    { title: '¡Moto desbloqueada! 🏍',    hint: 'La moto tiene su propia liga. Mejorá el Motor antes de la primera carrera.' },
        rally:   { title: '¡Camioneta Rally! 🚙',       hint: 'Terreno, barro, grava — la Rally lo maneja todo.' },
        formula: { title: '¡Fórmula desbloqueada! 🏎', hint: 'La categoría reina del automovilismo. Tiene pit stop obligatorio.' },
    };

    // ── State helpers ─────────────────────────────────────────────
    function step()   { return game.ftue ? game.ftue.step   : 0; }
    function isDone() { return game.ftue && game.ftue.completed; }

    // ── Overlay element ───────────────────────────────────────────
    function _getOverlay() {
        let el = document.getElementById('ftue-overlay');
        if (!el) {
            el = document.createElement('div');
            el.id = 'ftue-overlay';
            const app = document.getElementById('app') || document.body;
            app.appendChild(el);
        }
        return el;
    }

    // ── Position the arrow pointing at a CSS-selector element ─────
    function _positionArrow(targetSel, dir) {
        const arrow = document.getElementById('ftue-arrow');
        if (!arrow) return;

        const targetEl = document.querySelector(targetSel);
        if (!targetEl) { arrow.style.display = 'none'; return; }

        const appEl  = document.getElementById('app') || document.body;
        const appRect = appEl.getBoundingClientRect();
        const tRect   = targetEl.getBoundingClientRect();

        // center of target relative to #app
        const cx = tRect.left - appRect.left + tRect.width  / 2;
        const cy = tRect.top  - appRect.top  + tRect.height / 2;

        arrow.style.display  = 'flex';
        arrow.style.position = 'absolute';

        if (dir === 'down') {
            // arrow floats ABOVE the target, pointing down
            arrow.innerHTML   = '▼';
            arrow.style.left  = (cx - 16) + 'px';
            arrow.style.top   = (cy - tRect.height / 2 - 44) + 'px';
        } else if (dir === 'up') {
            // arrow floats BELOW the target, pointing up
            arrow.innerHTML   = '▲';
            arrow.style.left  = (cx - 16) + 'px';
            arrow.style.top   = (cy + tRect.height / 2 + 10) + 'px';
        } else if (dir === 'right') {
            // arrow floats to the LEFT of the target, pointing right
            arrow.innerHTML   = '▶';
            arrow.style.left  = (tRect.left - appRect.left - 44) + 'px';
            arrow.style.top   = (cy - 16) + 'px';
        } else {
            // left — arrow floats to the RIGHT, pointing left
            arrow.innerHTML   = '◀';
            arrow.style.left  = (tRect.right - appRect.left + 10) + 'px';
            arrow.style.top   = (cy - 16) + 'px';
        }
    }

    // ── Render a tutorial step ────────────────────────────────────
    function _show(s) {
        const el = _getOverlay();

        const dotsHtml = s.dots
            .map(active => `<div class="ftue-dot${active ? ' ftue-dot-active' : ''}"></div>`)
            .join('');

        el.innerHTML = `
        <div id="ftue-arrow" class="ftue-arrow-el"></div>
        <div class="ftue-panel">
            <div class="ftue-bubble">
                <div class="ftue-bubble-name">🦁 TATA LION</div>
                <div class="ftue-bubble-title">${s.msg}</div>
                <div class="ftue-bubble-hint">${s.sub}</div>
                <div class="ftue-bubble-footer">
                    <div class="ftue-dots">${dotsHtml}</div>
                    <div class="ftue-footer-right">
                        <button class="ftue-skip-btn" onclick="FTUEManager.skip()">Saltar tutorial</button>
                    </div>
                </div>
            </div>
            <div class="ftue-character">
                <img src="assets/tata-lion.png" alt="Tata Lion">
            </div>
        </div>`;

        el.classList.add('ftue-visible');

        // Position arrow after DOM paint
        requestAnimationFrame(() => {
            _positionArrow(s.target, s.arrowDir);
        });
    }

    function _showTip(title, hint) {
        const el = _getOverlay();
        el.innerHTML = `
        <div class="ftue-panel">
            <div class="ftue-bubble">
                <div class="ftue-bubble-name">🦁 TATA LION</div>
                <div class="ftue-bubble-title">${title}</div>
                <div class="ftue-bubble-hint">${hint}</div>
                <div class="ftue-bubble-footer">
                    <div class="ftue-dots"></div>
                    <div class="ftue-footer-right">
                        <button class="ftue-next-btn" id="ftueNextBtn" onclick="FTUEManager.closeTip()">¡Entendido!</button>
                    </div>
                </div>
            </div>
            <div class="ftue-character">
                <img src="assets/tata-lion.png" alt="Tata Lion">
            </div>
        </div>`;
        el.classList.add('ftue-visible');
    }

    function _hide() {
        const el = document.getElementById('ftue-overlay');
        if (el) {
            el.classList.remove('ftue-visible');
            setTimeout(() => { if (el.parentNode) el.remove(); }, 320);
        }
    }

    // ── Advance to next step ──────────────────────────────────────
    function advance(to) {
        if (isDone() || to <= step()) return;
        game.ftue.step = to;

        // After step 4 (minigame) → show name modal instead of continuing
        if (to === 5) {
            _hide();
            save_user_progress();
            // Small delay so minigame close animation finishes
            setTimeout(() => _showNameModal(), 600);
            return;
        }

        if (to > 5) {
            game.ftue.completed = true;
            _hide();
            notifySuccess("🏆 ¡Tutorial completo! Sos un Tycoon de verdad. 🦁");
            save_user_progress();
            return;
        }

        const s = STEPS.find(x => x.step === to);
        if (s) _show(s);
        save_user_progress();
    }

    // ── Name modal shown AFTER tutorial ──────────────────────────
    function _showNameModal() {
        if (document.getElementById('ftue-name-modal')) return;

        const overlay = document.createElement('div');
        overlay.id        = 'ftue-name-modal';
        overlay.className = 'profile-modal-overlay';
        overlay.innerHTML = `
        <div class="profile-modal">
            <div class="pm-tata-row">
                <img src="assets/tata-lion.png" class="pm-tata-img" alt="Tata Lion">
                <div class="pm-tata-speech">
                    <div class="pm-speech-from">🦁 Tata Lion</div>
                    <div class="pm-speech-text">¡Impresionante piloto! Ahora decime... ¿Cómo te llamás y cómo se llama tu garage?</div>
                </div>
            </div>
            <label class="profile-label">Tu nombre</label>
            <input class="profile-input" id="ftuePlayerName" placeholder="Ej: Carlos" maxlength="24">
            <label class="profile-label">Nombre de tu garage</label>
            <input class="profile-input" id="ftueGarageName" placeholder="Ej: Scuderia Veloz" maxlength="32">
            <button class="rbtn accent-btn pm-start-btn" onclick="FTUEManager.submitName()">🏆 ¡Guardar y terminar!</button>
        </div>`;
        document.body.appendChild(overlay);
        setTimeout(() => { const i = document.getElementById('ftuePlayerName'); if (i) i.focus(); }, 100);
    }

    function submitName() {
        const n = document.getElementById('ftuePlayerName');
        const g = document.getElementById('ftueGarageName');
        game.playerName = (n && n.value.trim()) || 'Jugador';
        game.garageName = (g && g.value.trim()) || 'Mi Garage';

        const modal = document.getElementById('ftue-name-modal');
        if (modal) modal.remove();

        game.ftue = { completed: true, step: 6 };
        save_user_progress();
        updateGarageHud();
        notifySuccess("🏆 ¡Tutorial completo! Sos un Tycoon de verdad. 🦁");
    }

    // ── Tips after FTUE ───────────────────────────────────────────
    const _storyTips = [
        { title: '💡 Consejo de Tata Lion', hint: 'El dinero offline sigue corriendo aunque cierres el juego. ¡Volvé seguido!' },
        { title: '🏁 Tip de carrera',        hint: 'Mejorá el Motor para ganar más carreras desde el principio.' },
        { title: '💰 Maximizá ingresos',     hint: 'Sponsors + Mecánicos + Reparaciones = dinero constante.' },
        { title: '📺 Videos gratis',          hint: 'Ver un video te da 2 diamantes. ¡Acumula para contratar Ingenieros Pro!' },
        { title: '🎯 Tareas diarias',         hint: 'Las tareas del 🎯 se resetean cada día. Son la forma más fácil de ganar XP.' },
        { title: '🚛 Minijuego',              hint: 'El camión da $150 por segundo. ¡En 30 segundos podés ganar $4,500!' },
        { title: '⭐ Autos Estrella',         hint: 'Los autos raros (⭐) pagan $1,800+ pero tardan más. Un video los completa al instante.' },
    ];
    let _tipIdx = 0;
    function _showRandomTip() {
        const tip = _storyTips[_tipIdx % _storyTips.length];
        _tipIdx++;
        _showTip(tip.title, tip.hint);
    }

    // ── Public API ────────────────────────────────────────────────
    function init() {
        if (!game.ftue) game.ftue = { completed: false, step: 0 };

        if (isDone()) return;

        // First time ever — start immediately without asking name
        if (step() === 0) {
            game.ftue.step = 1;
            save_user_progress();
        }

        const s = STEPS.find(x => x.step === step());
        if (s) {
            // Short delay so garage finishes rendering
            setTimeout(() => _show(s), 500);
        }
    }

    function skip() {
        game.ftue = { completed: true, step: 6 };
        _hide();
        // If no name yet, still show name modal
        if (!game.playerName) {
            setTimeout(() => _showNameModal(), 300);
        }
        save_user_progress();
    }

    function tataPress() {
        if (!isDone()) {
            const s = STEPS.find(x => x.step === step());
            if (s) _show(s);
        } else {
            _showRandomTip();
        }
    }

    function closeTip() { _hide(); }

    return {
        init,
        skip,
        submitName,
        closeTip,
        tataPress,
        isCompleted: isDone,
        currentStep: step,
        showTip: _showTip,

        // Event hooks called from game modules
        onProfileSaved()  { /* name is now asked at end, not start */ },
        onCarReceived()   { if (step() === 1) setTimeout(() => advance(2), 1200); },
        onCarCompleted()  { },
        onRaceStarted()   { },
        onRaceCompleted() { if (step() === 2) setTimeout(() => advance(3), 1500); },
        onMechanicHired() { if (step() === 3) setTimeout(() => advance(4), 1200); },
        onCarUpgraded()   { },
        onGarageUpgradePurchased() { },
        onMinigameStarted() { if (step() === 4) setTimeout(() => advance(5), 25000); },

        onVehicleUnlocked(vehicleId) {
            const tip = VEHICLE_TIPS[vehicleId];
            if (tip) _showTip(tip.title, tip.hint);
        },
        onLevelUp(level) {
            const tip = LEVEL_TIPS[level];
            if (tip) _showTip(tip.title, tip.hint);
        },
    };
})();

window.FTUEManager = FTUEManager;
