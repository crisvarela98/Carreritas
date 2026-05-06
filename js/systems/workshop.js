function generateCar() {

    let rare = Math.random() < 0.2;

    return {
        id: Date.now() + Math.random(),
        duration: 10 + Math.random() * 10,
        progress: 0,
        reward: rare ? 500 : 150,
        rare
    };
}

function addCar() {

    if (game.workshop.queue.length > 5) {
        notify("Cola llena");
        return;
    }

    game.workshop.queue.push(generateCar());

    renderWorkshop();
}

function assignCars() {

    while (
        game.workshop.active.length < game.workshop.capacity &&
        game.workshop.queue.length > 0
    ) {
        game.workshop.active.push(
            game.workshop.queue.shift()
        );
    }
}

function renderWorkshop() {

    const workshopContent =
        document.getElementById("workshopContent");

    let html = `
        <div class="panel">

            <h3>Taller</h3>

            <p>💰 $${game.money}</p>
            <p>🏆 Reputación: ${game.reputation}</p>

            <button onclick="addCar()">
                Recibir Auto
            </button>

        </div>

        <h3>En reparación</h3>
    `;

    game.workshop.active.forEach(car => {

        html += `
            <div class="panel">

                <p>
                    ${car.rare ? "⭐ Auto raro" : "🚗 Auto normal"}
                </p>

                <p>
                    ${Math.floor(
                        (car.progress / car.duration) * 100
                    )}%
                </p>

            </div>
        `;
    });

    html += `<h3>En cola</h3>`;

    game.workshop.queue.forEach(car => {

        html += `
            <div class="panel">

                <p>
                    ${car.rare ? "⭐ Auto raro" : "🚗 Auto normal"}
                </p>

            </div>
        `;
    });

    workshopContent.innerHTML = html;
}

// ===== LOOP =====
setInterval(() => {

    assignCars();

    let speed = game.workshop.speed;

    game.employees.forEach(employee => {
        speed += employee.speed;
    });

    game.workshop.active.forEach(car => {

        car.progress += speed;

        game.money -= 1;

        if (car.progress >= car.duration) {

            let boost =
                game.sponsor
                    ? game.sponsor.money
                    : 1;

            let reward =
                Math.floor(car.reward * boost);

            game.money += reward;

            addXP(car.rare ? 100 : 50);

            game.reputation += car.rare ? 2 : 1;

            notify("Auto terminado +$" + reward);

            game.workshop.active =
                game.workshop.active.filter(
                    c => c.id !== car.id
                );
        }
    });

    renderWorkshop();

}, 1000);