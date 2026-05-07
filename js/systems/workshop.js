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
    const workshopContent = document.getElementById("workshopContent");
    if (!workshopContent) return;

    let html = `
        <div class="panel">
            <h3>Taller (Nivel ${game.workshop.level})</h3>
            <p>💰 $${game.money}</p>
            <p>🏆 Reputación: ${game.reputation}</p>
            <p>Bahías disponibles: ${game.workshop.capacity - game.workshop.active.length} / ${game.workshop.capacity}</p>
            <button onclick="addCar()">Recibir Auto</button>
        </div>
        <h3>En reparación</h3>
    `;

    if (game.workshop.active.length === 0) {
        html += `<div class="panel"><p>Ningún auto en reparación.</p></div>`;
    }

    game.workshop.active.forEach(car => {
        const pct = Math.floor((car.progress / car.duration) * 100);
        html += `
            <div class="panel">
                <p>${car.rare ? "⭐ Auto raro" : "🚗 Auto normal"}</p>
                <p>Progreso: ${pct}%</p>
                <div style="background:#334155;border-radius:4px;height:8px;margin-top:4px;">
                    <div style="background:#22c55e;width:${pct}%;height:100%;border-radius:4px;"></div>
                </div>
            </div>
        `;
    });

    html += `<h3>En cola (${game.workshop.queue.length}/5)</h3>`;

    if (game.workshop.queue.length === 0) {
        html += `<div class="panel"><p>Cola vacía.</p></div>`;
    }

    game.workshop.queue.forEach(car => {
        html += `
            <div class="panel">
                <p>${car.rare ? "⭐ Auto raro" : "🚗 Auto normal"} — esperando</p>
            </div>
        `;
    });

    workshopContent.innerHTML = html;
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
            const boost = game.sponsor ? game.sponsor.money : 1;
            const reward = Math.floor(car.reward * boost);

            game.money += reward;
            addXP(car.rare ? 100 : 50);
            game.reputation += car.rare ? 2 : 1;
            notify("Auto terminado +$" + reward);

            game.workshop.active = game.workshop.active.filter(c => c.id !== car.id);
        }
    });

    renderWorkshop();
}, 1000);
