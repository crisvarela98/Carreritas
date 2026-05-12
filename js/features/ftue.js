// ── FTUE — Tata Lion guided tutorial ──────────────────────────────
// Steps: 0=profile, 1=receive first car, 2=run first race, 3=done

const FTUEManager = (() => {

    const STEPS = [
        {
            step: 1,
            title: "¡Recibí tu primer auto!",
            hint: "Toca el botón 🚗 del centro para meter tu primer cliente al taller y empezar a ganar monedas.",
            dots: [true, false]
        },
        {
            step: 2,
            title: "¡Ahora a correr!",
            hint: "Toca '🏁 Carrera' en el menú lateral y lanzá tu primera clasificación. ¡El circuito te espera!",
            dots: [true, true]
        }
    ];

    // Tips shown at specific levels/events (after FTUE is done)
    const LEVEL_TIPS = {
        5:  { title: '¡Conseguí un sponsor!',   hint: 'Toca 💰 Sponsors arriba. Un sponsor te da más dinero en cada carrera. ¡No te lo pierdas!' },
        10: { title: '¡Mejorá el taller!',       hint: 'Toca 🔧 Taller → Garage. Las herramientas Pro aceleran las reparaciones. ¡Ahorrás tiempo!' },
        20: { title: '¡Completá tus tareas!',    hint: 'Toca 🎯 arriba a la derecha. Las tareas diarias te dan monedas y XP gratis todos los días.' },
    };

    const VEHICLE_TIPS = {
        moto:    { title: '¡Moto desbloqueada! 🏍',       hint: 'La moto es más rápida que el auto. Úsala en carreras para sumar más puntos de liga.' },
        rally:   { title: '¡Camioneta Rally! 🚙',          hint: 'Terreno, barro, grava... ¡la Rally lo maneja todo! Llevala al off-road y dominá el campeonato.' },
        formula: { title: '¡Fórmula desbloqueada! 🏎',    hint: 'La categoría reina del automovilismo. Mejorá todas las piezas al máximo para competir de verdad.' },
    };

    function step()   { return game.ftue ? game.ftue.step : 0; }
    function isDone() { return game.ftue && game.ftue.completed; }

    function advance(to) {
        if (isDone() || to <= step()) return;
        game.ftue.step = to;
        if (to >= 3) {
            game.ftue.completed = true;
            _hide();
            notifySuccess("🏆 ¡Tutorial completo! Sos un Tycoon de verdad.");
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

    function _buildBubble(title, hint, dots, nextLabel, nextAction) {
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
                        <button class="ftue-next-btn" onclick="${nextAction}">${nextLabel}</button>
                        ${dots ? `<button class="ftue-skip-btn" onclick="FTUEManager.skip()">Saltar tutorial</button>` : ''}
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
        const nextLabel = nextStep >= 3 ? 'Finalizar →' : 'Siguiente →';
        el.innerHTML = _buildBubble(s.title, s.hint, s.dots, nextLabel, `FTUEManager.next()`);
        el.classList.add('ftue-visible');
    }

    function _showTip(title, hint) {
        const el = _getContainer();
        el.innerHTML = _buildBubble(title, hint, null, '¡Entendido!', `FTUEManager.closeTip()`);
        el.classList.add('ftue-visible');
    }

    function _hide() {
        const el = document.getElementById('ftue-overlay');
        if (el) { el.classList.remove('ftue-visible'); setTimeout(() => el.remove(), 320); }
    }

    function skip() {
        game.ftue = { completed: true, step: 3 };
        _hide();
        save_user_progress();
    }

    function next() {
        const s = step();
        if (s >= 2) { skip(); return; }
        advance(s + 1);
    }

    function closeTip() {
        _hide();
    }

    function init() {
        if (isDone()) return;
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
        onProfileSaved()    { if (step() === 0) advance(1); },
        onCarReceived()     { if (step() === 1) advance(2); },
        onCarCompleted()    { },
        onRaceStarted()     { },
        onRaceCompleted()   { if (step() === 2) advance(3); },
        onCarUpgraded()     { },
        onMechanicHired()   { },
        onGarageUpgradePurchased() { },

        // Tip shown when a vehicle unlocks
        onVehicleUnlocked(vehicleId) {
            const tip = VEHICLE_TIPS[vehicleId];
            if (tip) _showTip(tip.title, tip.hint);
        },

        // Tip shown on level-up milestones
        onLevelUp(level) {
            const tip = LEVEL_TIPS[level];
            if (tip) _showTip(tip.title, tip.hint);
        },

        // Manual tip trigger (can be called from anywhere)
        showTip: _showTip
    };
})();

window.FTUEManager = FTUEManager;
