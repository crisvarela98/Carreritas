// ── FTUE — Tata Lion guided tutorial ──────────────────────────────
// Extended steps: 1=receive car, 2=run race, 3=hire mechanic,
//                 4=learn minigame, 5=upgrade car, 6=done

const FTUEManager = (() => {

    const STEPS = [
        {
            step: 1,
            title: "¡Recibí tu primer auto!",
            hint: "Tocá el botón 🚗 en el centro del garaje para recibir tu primer cliente. Cada reparación te da dinero y experiencia.",
            dots: [true, false, false, false, false]
        },
        {
            step: 2,
            title: "¡Ahora a correr!",
            hint: "Tocá '🏁 Carrera' en el menú lateral. La liga de Autos es estilo Trackday — ¡podés ganar desde el principio!",
            dots: [true, true, false, false, false]
        },
        {
            step: 3,
            title: "¡Contratá un mecánico!",
            hint: "Tocá '👷 Staff' arriba. Los mecánicos reparan los autos automáticamente. Un Mecánico Junior cuesta $600 y ya ayuda mucho.",
            dots: [true, true, true, false, false]
        },
        {
            step: 4,
            title: "¿Para qué sirve el camión? 🚛",
            hint: "El botón 🚛 de la derecha abre un mini-juego de conducción. Esquivá el tráfico y ganás $150 por segundo. ¡Jugalo cuando necesites dinero rápido!",
            dots: [true, true, true, true, false]
        },
        {
            step: 5,
            title: "¡Mejorá tu auto de carrera!",
            hint: "Andá a 🔧 Taller → pestaña Vehículos. Mejorar el Motor y los Neumáticos baja tu tiempo de vuelta y te ayuda a ganar más carreras.",
            dots: [true, true, true, true, true]
        }
    ];

    // Tips shown at specific levels/events (after FTUE is done)
    const LEVEL_TIPS = {
        5:  { title: '¡Conseguí un sponsor!',    hint: 'Tocá 💰 Sponsors arriba. Un sponsor te da más dinero en cada carrera. ¡No te lo pierdas!' },
        10: { title: '¡Mejorá el taller!',        hint: 'Tocá 🔧 Taller → Garage. Las Herramientas Pro aceleran reparaciones. ¡Ahorrás tiempo!' },
        15: { title: '¡Moto desbloqueada pronto!', hint: 'Al nivel 15 desbloqueás la Moto de Carreras. Empezá a ahorrar para mejorarla.' },
        20: { title: '¡Completá tus tareas!',      hint: 'Tocá 🎯 arriba a la derecha. Las tareas diarias te dan monedas y XP gratis todos los días.' },
    };

    const VEHICLE_TIPS = {
        moto:    { title: '¡Moto desbloqueada! 🏍',     hint: 'La moto tiene su propia liga. Es más rápida y competitiva. Mejorá el Motor antes de la primera carrera.' },
        rally:   { title: '¡Camioneta Rally! 🚙',        hint: 'Terreno, barro, grava — la Rally lo maneja todo. Las etapas especiales cambian el resultado cada vez.' },
        formula: { title: '¡Fórmula desbloqueada! 🏎',  hint: 'La categoría reina del automovilismo. Tiene pit stop obligatorio — elegí bien la estrategia de neumáticos.' },
    };

    function step()   { return game.ftue ? game.ftue.step : 0; }
    function isDone() { return game.ftue && game.ftue.completed; }

    function advance(to) {
        if (isDone() || to <= step()) return;
        game.ftue.step = to;
        if (to >= 6) {
            game.ftue.completed = true;
            _hide();
            notifySuccess("🏆 ¡Tutorial completo! Sos un Tycoon de verdad. 🦁");
            _showFloatingBtn();
            save_user_progress();
            return;
        }
        const s = STEPS.find(x => x.step === to);
        if (s) _show(s);
        save_user_progress();
    }

    function _getContainer() {
        let el = document.getElementById('ftue-overlay');
        if (!el) {
            el = document.createElement('div');
            el.id = 'ftue-overlay';
            const app = document.getElementById('app') || document.body;
            app.appendChild(el);
        }
        return el;
    }

    function _buildBubble(title, hint, dots, nextLabel, nextAction, showSkip) {
        const dotsHtml = dots
            ? dots.map(active => `<div class="ftue-dot${active ? ' ftue-dot-active' : ''}"></div>`).join('')
            : '';
        return `
        <div class="ftue-panel">
            <div class="ftue-bubble">
                <div class="ftue-bubble-name">🦁 TATA LION</div>
                <div class="ftue-bubble-title">${title}</div>
                <div class="ftue-bubble-hint">${hint}</div>
                <div class="ftue-bubble-footer">
                    <div class="ftue-dots">${dotsHtml}</div>
                    <div class="ftue-footer-right">
                        <button class="ftue-next-btn" id="ftueNextBtn" onclick="${nextAction}">${nextLabel}</button>
                        ${showSkip !== false ? `<button class="ftue-skip-btn" onclick="FTUEManager.skip()">Saltar tutorial</button>` : ''}
                    </div>
                </div>
            </div>
            <div class="ftue-character">
                <img src="assets/tata-lion.png" alt="Tata Lion">
            </div>
        </div>`;
    }

    function _show(s) {
        const el = _getContainer();
        const nextStep  = s.step + 1;
        const nextLabel = nextStep >= 6 ? 'Finalizar →' : 'Siguiente →';
        el.innerHTML = _buildBubble(s.title, s.hint, s.dots, nextLabel, `FTUEManager.next()`);
        el.classList.add('ftue-visible');
    }

    function _showTip(title, hint) {
        const el = _getContainer();
        el.innerHTML = _buildBubble(title, hint, null, '¡Entendido!', `FTUEManager.closeTip()`, false);
        el.classList.add('ftue-visible');
    }

    function _hide() {
        const el = document.getElementById('ftue-overlay');
        if (el) { el.classList.remove('ftue-visible'); setTimeout(() => { if (el.parentNode) el.remove(); }, 320); }
    }

    // ── Floating Tata Lion button (shown after tutorial) ──────────
    function _showFloatingBtn() {
        if (document.getElementById('tataFloatBtn')) return;
        const btn = document.createElement('button');
        btn.id        = 'tataFloatBtn';
        btn.className = 'tata-float-btn';
        btn.innerHTML = `<img src="assets/tata-lion.png" alt="Tata">`;
        btn.title     = 'Tata Lion';
        btn.onclick   = () => _showRandomTip();
        (document.getElementById('app') || document.body).appendChild(btn);
    }

    const _storyTips = [
        { title: '💡 Consejo de Tata Lion', hint: 'El dinero offline sigue corriendo aunque cierres el juego. ¡Volvé seguido para reclamar tus ganancias!' },
        { title: '🏁 Tip de carrera',        hint: 'En la liga de Autos, los rivales son estilo trackday. Mejorá el Motor para ganar cómodamente desde el principio.' },
        { title: '💰 Maximizá ingresos',     hint: 'Sponsors + Mecánicos + Reparaciones = dinero constante. Tené siempre autos en el taller y un sponsor activo.' },
        { title: '📺 Videos gratis',          hint: 'Ver un video debajo de 💎 te da 2 diamantes. ¡Acumula para contratar Ingenieros Pro!' },
        { title: '🎯 Tareas diarias',         hint: 'Las tareas del 🎯 se resetean cada día. Son la forma más fácil de ganar XP y subir de nivel.' },
        { title: '🚛 Minijuego',              hint: 'El camión 🚛 da $150 por segundo que sobrevivís. ¡En 30 segundos podés ganar $4,500!' },
        { title: '⭐ Autos Estrella',         hint: 'Los autos raros (estrella ⭐) pagan $1,800+ pero tardan 15 min. Un video los completa al instante.' },
    ];
    let _tipIdx = 0;
    function _showRandomTip() {
        const tip = _storyTips[_tipIdx % _storyTips.length];
        _tipIdx++;
        _showTip(tip.title, tip.hint);
    }

    function skip() {
        game.ftue = { completed: true, step: 6 };
        _hide();
        _showFloatingBtn();
        save_user_progress();
    }

    function next() {
        const s = step();
        if (s >= 5) { skip(); return; }
        // Disable button briefly so user has time to read before advancing
        const btn = document.getElementById('ftueNextBtn');
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            setTimeout(() => {
                if (btn) { btn.disabled = false; btn.style.opacity = ''; }
            }, 800);
        }
        setTimeout(() => advance(s + 1), 400);
    }

    function closeTip() {
        _hide();
    }

    function init() {
        if (isDone()) {
            _showFloatingBtn();
            return;
        }
        if (step() >= 1) {
            const s = STEPS.find(x => x.step === step());
            if (s) _show(s);
        }
    }

    return {
        init,
        skip,
        next,
        closeTip,
        isCompleted: isDone,
        currentStep: step,
        showTip: _showTip,
        onProfileSaved()    { if (step() === 0) advance(1); },
        onCarReceived()     { if (step() === 1) advance(2); },
        onCarCompleted()    { },
        onRaceStarted()     { },
        onRaceCompleted()   {
            if (step() === 2) {
                // After race, wait a beat then show mechanic tip
                setTimeout(() => advance(3), 1500);
            }
        },
        onMechanicHired()   {
            if (step() === 3) {
                setTimeout(() => advance(4), 1200);
            }
        },
        onCarUpgraded()     {
            if (step() === 5 || step() === 4) {
                setTimeout(() => advance(6), 1200);
            }
        },
        onGarageUpgradePurchased() { },

        // Minigame started — advance step 4 → 5
        onMinigameStarted() {
            if (step() === 4) {
                setTimeout(() => advance(5), 1500);
            }
        },

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
