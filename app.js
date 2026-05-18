// ===== ELEMENTOS HTML =====
const dashboardContent = document.getElementById("dashboardContent");
const workshopContent = document.getElementById("workshopContent");
const employeesContent = document.getElementById("employeesContent");
const sponsorsContent = document.getElementById("sponsorsContent");
const leagueContent = document.getElementById("leagueContent");
const notifications = document.getElementById("notifications");

const ftueOverlay = document.getElementById("ftueOverlay");
const ftueMessage = document.getElementById("ftueMessage");
const ftueArrow = document.getElementById("ftueArrow");
const ftueNameForm = document.getElementById("ftueNameForm");
const ftuePopup = document.getElementById("ftuePopup");
const playerNameInput = document.getElementById("playerNameInput");
const garageNameInput = document.getElementById("garageNameInput");
const saveNameButton = document.getElementById("saveNameButton");
const truckCityWrapper = document.getElementById("truckCityWrapper");

const ftueSteps = [
    {
        id: 1,
        message: "🚗 Tocá el auto para repararlo",
        selector: "#workshopAddCarBtn",
        screen: "workshop"
    },
    {
        id: 2,
        message: "🏁 Corré tu primera carrera",
        selector: "#runRaceBtn",
        screen: "race"
    },
    {
        id: 3,
        message: "👨‍🔧 Contratá un mecánico",
        selector: "#hireEmployeeBtn",
        screen: "employees"
    },
    {
        id: 4,
        message: "🚚 Probá el camión ciudad para ganar dinero rápido",
        selector: "#truckCityBtn",
        screen: "dashboard"
    },
    {
        id: 5,
        message: "",
        selector: null,
        screen: null
    }
];

let ftueStep = 0;
let truckCityTimer = null;

// ===== CAMBIO DE PANTALLA =====
function showScreen(id) {
    if (ftueStep > 0 && ftueStep < 5) {
        const step = ftueSteps.find(s => s.id === ftueStep);

        if (step && step.screen !== id) {
            notify("Seguí el paso del tutorial primero");
            return;
        }
    }

    document.querySelectorAll(".screen")
        .forEach(screen => screen.classList.remove("active"));

    document.getElementById(id).classList.add("active");
}

// ===== DASHBOARD =====
function renderDashboard() {
    dashboardContent.innerHTML = `
        <div class="panel">
            <h3>Empresa</h3>

            <p>💰 Dinero: $${game.money}</p>
            <p>⭐ Nivel: ${game.level}</p>
            <p>🏆 Reputación: ${game.reputation}</p>
            <p>📈 XP: ${game.xp}</p>

            <p>
                🤝 Sponsor:
                ${game.sponsor ? game.sponsor.name : "Ninguno"}
            </p>
        </div>
    `;
}

// ===== FTUE =====
function startFTUE() {
    if (localStorage.getItem("mgt_ftue_completed") === "true") {
        truckCityWrapper.classList.add("hidden");
        return;
    }

    ftueStep = 1;
    ftueOverlay.classList.remove("hidden");
    ftueNameForm.classList.add("hidden");
    truckCityWrapper.classList.remove("hidden");
    showStep();
}

function showStep() {
    const step = ftueSteps.find(s => s.id === ftueStep);

    if (!step) return;

    if (ftueStep === 5) {
        showNameForm();
        return;
    }

    ftueOverlay.classList.remove("hidden");
    ftuePopup.classList.remove("hidden");
    ftueNameForm.classList.add("hidden");
    ftueMessage.textContent = step.message;
    ftueArrow.classList.add("active");

    if (step.screen) {
        showScreen(step.screen);
    }

    setTimeout(() => {
        positionArrowOver(step.selector);
    }, 50);
}

function nextStep() {
    ftueStep++;
    showStep();
}

function showNameForm() {
    ftuePopup.classList.add("hidden");
    ftueArrow.classList.remove("active");
    ftueArrow.style.left = "-9999px";
    ftueNameForm.classList.remove("hidden");
    ftueOverlay.classList.remove("hidden");
    ftueMessage.textContent = "";
}

function completeFTUE() {
    localStorage.setItem("mgt_ftue_completed", "true");
    ftueOverlay.classList.add("hidden");
    ftueNameForm.classList.add("hidden");
    ftueArrow.classList.remove("active");
    truckCityWrapper.classList.add("hidden");
}

function positionArrowOver(selector) {
    const element = document.querySelector(selector);

    if (!element) {
        ftueArrow.classList.remove("active");
        return;
    }

    const rect = element.getBoundingClientRect();
    const left = rect.left + rect.width / 2 - 32;
    const top = rect.top - 90;

    ftueArrow.style.left = `${Math.max(12, left)}px`;
    ftueArrow.style.top = `${Math.max(12, top)}px`;
}

function tryAdvanceFtue(step) {
    if (ftueStep === step) {
        nextStep();
    }
}

function startTruckCity() {
    if (ftueStep === 4) {
        ftueMessage.textContent = "🚚 Jugando Camión Ciudad..."
        ftueArrow.classList.remove("active");

        if (truckCityTimer) {
            clearTimeout(truckCityTimer);
        }

        truckCityTimer = setTimeout(() => {
            notify("Terminaste el mini-juego del camión ciudad");
            nextStep();
        }, 22000);
    }

    if (typeof runTruckCityGame === "function") {
        runTruckCityGame();
    }
}

saveNameButton.addEventListener("click", () => {
    const playerName = playerNameInput.value.trim();
    const garageName = garageNameInput.value.trim();

    if (!playerName || !garageName) {
        notify("Completa los dos campos para continuar");
        return;
    }

    game.playerName = playerName;
    game.garageName = garageName;
    notify(`¡Bienvenido, ${playerName}!`);
    completeFTUE();
});

// ===== INICIALIZACIÓN =====
const splashScreen = document.getElementById("splashScreen");
const splashUserLogo = document.getElementById("splashUserLogo");
const splashGameLogo = document.getElementById("splashGameLogo");

function initGame() {
    // cargar guardado
    loadGame();

    // progreso offline
    applyOffline();

    // iniciar liga
    initLeague();

    // render inicial
    renderDashboard();
    renderWorkshop();
    renderEmployees();
    renderSponsors();
    renderLeague();

    // autosave
    startAutoSave();

    // refresco UI
    setInterval(() => {
        renderDashboard();
    }, 1000);

    startFTUE();
}

function showSplashSequence() {
    document.body.classList.add("splash-active");
    splashUserLogo.classList.remove("hidden");
    splashGameLogo.classList.add("hidden");

    setTimeout(() => {
        splashUserLogo.classList.add("hidden");
        splashGameLogo.classList.remove("hidden");
    }, 1500);

    setTimeout(() => {
        if (splashScreen) {
            splashScreen.style.display = "none";
        }
        document.body.classList.remove("splash-active");
        initGame();
    }, 3000);
}

window.onload = () => {
    showSplashSequence();
};