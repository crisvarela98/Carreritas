// ── FTUE Manager ──────────────────────────────────────────────────
// Steps: 0=profile, 1=repair first car, 2=complete repair,
//        3=run first race, 4=upgrade vehicle, 5=done

const FTUEManager = (() => {
    const STEPS = [
        { step: 0, title: "¡Bienvenido!",          hint: "Ingresa tu nombre y el nombre de tu taller." },
        { step: 1, title: "Recibe tu primer auto",  hint: "Taller → '+ Recibir' para ganar dinero." },
        { step: 2, title: "Completa la reparación", hint: "Espera que el auto termine. ¡Ganarás monedas!" },
        { step: 3, title: "Corre tu primera carrera", hint: "Carreras → 'Iniciar clasificación'." },
        { step: 4, title: "Mejora tu vehículo",     hint: "Taller → Vehículos → mejora cualquier pieza." },
        { step: 5, title: "¡Tutorial completo!",    hint: "" }
    ];

    function step()       { return game.ftue ? game.ftue.step : 0; }
    function isDone()     { return game.ftue && game.ftue.completed; }

    function advance(to) {
        if (isDone() || to <= step()) return;
        game.ftue.step = to;
        if (to >= 5) {
            game.ftue.completed = true;
            _hide();
            notifySuccess("🎉 ¡Tutorial completo! Ya eres un Tycoon.");
            save_user_progress();
            return;
        }
        _show(STEPS[to]);
        save_user_progress();
    }

    function _show(s) {
        let b = document.getElementById("ftue-banner");
        if (!b) { b = document.createElement("div"); b.id = "ftue-banner"; document.body.appendChild(b); }
        b.innerHTML = `
            <div class="ftue-step-label">PASO ${s.step} / 4</div>
            <div class="ftue-title">${s.title}</div>
            <div class="ftue-hint">${s.hint}</div>
            <button class="ftue-skip" onclick="FTUEManager.skip()">Saltar tutorial</button>`;
        b.classList.add("ftue-visible");
    }

    function _hide() {
        const b = document.getElementById("ftue-banner");
        if (b) b.remove();
    }

    function skip() {
        game.ftue = { completed: true, step: 5 };
        _hide();
        save_user_progress();
    }

    function init() {
        if (isDone()) return;
        if (step() > 0) _show(STEPS[step()]);
    }

    return {
        init,
        skip,
        isCompleted: isDone,
        currentStep: step,
        onProfileSaved()          { if (step() === 0) advance(1); },
        onCarReceived()           { if (step() === 1) advance(2); },
        onCarCompleted()          { if (step() === 2) advance(3); },
        onRaceStarted()           { },
        onRaceCompleted()         { if (step() === 3) advance(4); },
        onCarUpgraded()           { if (step() === 4) advance(5); },
        onMechanicHired()         { },
        onGarageUpgradePurchased(){ if (step() === 4) advance(5); }
    };
})();

window.FTUEManager = FTUEManager;
