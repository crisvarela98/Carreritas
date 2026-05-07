let workshopTab = "repair";

function showWorkshopTab(tab) {
    workshopTab = tab;
    renderWorkshop();
}

function generateCar() {
    const rare = Math.random() < 0.2;
    return {
        id: Date.now() + Math.random(),
        duration: 10 + Math.random() * 10,
        progress: 0,
        reward: rare ? 500 : 150,
        rare
    };
}

function addCar() {
    if (game.workshop.queue.length >= 5) {
        notify("Cola llena — espera a que haya espacio");
        return;
    }
    game.workshop.queue.push(generateCar());
    renderWorkshop();
}

function assignCars() {
    if (!game.workshop || !Array.isArray(game.workshop.active)) return;
    while (
        game.workshop.active.length < game.workshop.capacity &&
        game.workshop.queue.length > 0
    ) {
        game.workshop.active.push(game.workshop.queue.shift());
    }
}

function renderWorkshop() {
    const el = document.getElementById("workshopContent");
    if (!el) return;

    const tabBar = `
        <div class="wtab-bar">
            <button class="wtab ${workshopTab === "repair" ? "wtab-active" : ""}"
                    onclick="showWorkshopTab('repair')">🔧 Reparaciones</button>
            <button class="wtab ${workshopTab === "car" ? "wtab-active" : ""}"
                    onclick="showWorkshopTab('car')">🏎 Auto</button>
        </div>
    `;

    if (workshopTab === "car") {
        el.innerHTML = tabBar + `<div id="carContent"></div>`;
        renderCarUpgrades();
        return;
    }

    // ── Repair tab ──
    let activeHtml = "";
    if (game.workshop.active.length === 0) {
        activeHtml = `<div class="empty-row">Sin autos en reparación</div>`;
    } else {
        game.workshop.active.forEach(car => {
            const pct = Math.floor((car.progress / car.duration) * 100);
            activeHtml += `
                <div class="car-card">
                    <div class="car-card-top">
                        <span>${car.rare ? "⭐ Auto raro" : "🚗 Auto normal"}</span>
                        <span class="car-pct">${pct}%</span>
                    </div>
                    <div class="car-progress-track">
                        <div class="car-progress-fill ${car.rare ? "rare" : ""}"
                             style="width:${pct}%"></div>
                    </div>
                </div>
            `;
        });
    }

    let queueHtml = "";
    if (game.workshop.queue.length === 0) {
        queueHtml = `<div class="empty-row">Cola vacía</div>`;
    } else {
        game.workshop.queue.forEach(car => {
            queueHtml += `
                <div class="car-card queued">
                    <span>${car.rare ? "⭐ Auto raro" : "🚗 Auto normal"}</span>
                    <span class="car-queue-tag">en cola</span>
                </div>
            `;
        });
    }

    el.innerHTML = `
        ${tabBar}
        <div class="race-card">
            <div class="ws-top-row">
                <div>
                    <div class="ws-money">💰 $${game.money.toLocaleString()}</div>
                    <div class="ws-sub">Bahías: ${game.workshop.active.length}/${game.workshop.capacity}</div>
                </div>
                <button class="rbtn accent-btn ws-recv-btn" onclick="addCar()">+ Recibir Auto</button>
            </div>
        </div>

        <div class="race-card">
            <div class="race-divider">EN REPARACIÓN</div>
            ${activeHtml}
        </div>

        <div class="race-card">
            <div class="race-divider">EN COLA (${game.workshop.queue.length}/5)</div>
            ${queueHtml}
        </div>
    `;
}

setInterval(() => {
    if (!game.workshop || !Array.isArray(game.workshop.active)) return;

    assignCars();

    let speed = game.workshop.speed || 1;
    if (Array.isArray(game.employees)) {
        game.employees.forEach(emp => { speed += emp.speed || 0; });
    }

    game.workshop.active.forEach(car => {
        car.progress += speed;
        game.money = Math.max(0, game.money - 1);

        if (car.progress >= car.duration) {
            const boost  = game.sponsor ? game.sponsor.money : 1;
            const reward = Math.floor(car.reward * boost);
            game.money   += reward;
            addXP(car.rare ? 100 : 50);
            game.reputation += car.rare ? 2 : 1;
            notify("Auto terminado +$" + reward);
            game.workshop.active = game.workshop.active.filter(c => c.id !== car.id);
        }
    });

    if (workshopTab === "repair") renderWorkshop();
}, 1000);
