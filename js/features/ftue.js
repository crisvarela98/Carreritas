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

    function _show(s) {
        const el = _getContainer();
        const dots = s.dots.map(active =>
            `<div class="ftue-dot${active ? ' ftue-dot-active' : ''}"></div>`
        ).join('');

        el.innerHTML = `
        <div class="ftue-panel">
            <div class="ftue-bubble">
                <div class="ftue-bubble-name">🦁 TATA LION</div>
                <div class="ftue-bubble-title">${s.title}</div>
                <div class="ftue-bubble-hint">${s.hint}</div>
                <div class="ftue-bubble-footer">
                    <div class="ftue-dots">${dots}</div>
                    <button class="ftue-skip-btn" onclick="FTUEManager.skip()">Saltar tutorial</button>
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
        if (el) { el.classList.remove('ftue-visible'); setTimeout(() => el.remove(), 300); }
    }

    function skip() {
        game.ftue = { completed: true, step: 3 };
        _hide();
        save_user_progress();
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
        isCompleted: isDone,
        currentStep: step,
        onProfileSaved()          { if (step() === 0) advance(1); },
        onCarReceived()           { if (step() === 1) advance(2); },
        onCarCompleted()          { },
        onRaceStarted()           { },
        onRaceCompleted()         { if (step() === 2) advance(3); },
        onCarUpgraded()           { },
        onMechanicHired()         { },
        onGarageUpgradePurchased(){ }
    };
})();

window.FTUEManager = FTUEManager;
