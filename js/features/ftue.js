// ── FTUE Manager ──────────────────────────────────────────────────
// Controls the First Time User Experience guided progression.
// Steps:
//   0 = profile setup (name / garage name)
//   1 = receive first car
//   2 = complete first repair
//   3 = upgrade a car part in Taller
//   4 = hire first mechanic
//   5 = run first race
//   6 = FTUE complete

const FTUEManager = (() => {

    const STEPS = [
        { step: 0, title: "¡Bienvenido al Garage!", hint: "Ingresa tu nombre y el nombre de tu taller para comenzar." },
        { step: 1, title: "Recibe tu primer auto",  hint: "Ve al Taller → toca '+ Recibir Auto' para comenzar a ganar dinero." },
        { step: 2, title: "Completa la reparación", hint: "Espera a que el auto termine. ¡Recibirás dinero y XP!" },
        { step: 3, title: "Mejora tu auto",         hint: "Ve al Taller → tab 'Auto' → mejora cualquier pieza." },
        { step: 4, title: "Contrata un mecánico",   hint: "Ve a Staff → contrata tu primer Mecánico Junior." },
        { step: 5, title: "¡Corre tu primera carrera!", hint: "Ve a Carrera → toca 'Iniciar clasificación'." },
        { step: 6, title: "¡FTUE completo!",        hint: "" }
    ];

    function currentStep() {
        return game.ftue ? game.ftue.step : 0;
    }

    function isCompleted() {
        return game.ftue && game.ftue.completed;
    }

    function advance(toStep) {
        if (isCompleted()) return;
        if (toStep <= currentStep()) return;

        game.ftue.step = toStep;

        if (toStep >= 6) {
            game.ftue.completed = true;
            _removeBanner();
            notify("🎉 ¡Tutorial completado! Ya eres un verdadero Tycoon.", "success");
            save_user_progress();
            return;
        }

        _showBanner(STEPS[toStep]);
        save_user_progress();
    }

    function _showBanner(stepDef) {
        let banner = document.getElementById("ftue-banner");
        if (!banner) {
            banner = document.createElement("div");
            banner.id = "ftue-banner";
            document.body.appendChild(banner);
        }
        banner.innerHTML = `
            <div class="ftue-step-label">PASO ${stepDef.step} / 5</div>
            <div class="ftue-title">${stepDef.title}</div>
            <div class="ftue-hint">${stepDef.hint}</div>
            <button class="ftue-skip" onclick="FTUEManager.skipFTUE()">Saltar tutorial</button>
        `;
        banner.classList.add("ftue-visible");
    }

    function _removeBanner() {
        const banner = document.getElementById("ftue-banner");
        if (banner) banner.remove();
    }

    function showCurrentHint() {
        if (isCompleted()) return;
        const step = STEPS[currentStep()];
        if (step) _showBanner(step);
    }

    function skipFTUE() {
        game.ftue.completed = true;
        game.ftue.step      = 6;
        _removeBanner();
        save_user_progress();
    }

    // ── Called by other systems ───────────────────────────────────

    function onProfileSaved() {
        if (currentStep() === 0) advance(1);
    }

    function onCarReceived() {
        if (currentStep() === 1) advance(2);
    }

    function onCarCompleted() {
        if (currentStep() === 2) advance(3);
    }

    function onCarUpgraded() {
        if (currentStep() === 3) advance(4);
    }

    function onMechanicHired() {
        if (currentStep() === 4) advance(5);
    }

    function onRaceStarted() {
        // nothing yet — wait for completion
    }

    function onRaceCompleted() {
        if (currentStep() === 5) advance(6);
    }

    function onGarageUpgradePurchased() {
        // Bonus progress if user buys garage upgrade during step 3
        if (currentStep() === 3) advance(4);
    }

    // ── Init ──────────────────────────────────────────────────────
    function init() {
        if (isCompleted()) return;
        if (currentStep() === 0) {
            // Will be triggered after profile modal
            return;
        }
        showCurrentHint();
    }

    return {
        init,
        advance,
        skipFTUE,
        showCurrentHint,
        onProfileSaved,
        onCarReceived,
        onCarCompleted,
        onCarUpgraded,
        onMechanicHired,
        onRaceStarted,
        onRaceCompleted,
        onGarageUpgradePurchased,
        isCompleted,
        currentStep
    };
})();
