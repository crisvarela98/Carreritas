let game = {
    engine: 1,
    aero: 1,
    money: 100,
    grid: []
};

// navegación
function goTo(screen) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screen).classList.add("active");
    updateUI();
}

// UI
function updateUI() {
    document.getElementById("engine").innerText = game.engine;
    document.getElementById("aero").innerText = game.aero;
    document.getElementById("money").innerText = game.money;
}

// mejoras
function upgrade(type) {
    if (game.money >= 50) {
        game[type]++;
        game.money -= 50;
        updateUI();
    } else {
        alert("No hay dinero");
    }
}

// clasificación
function qualify() {
    let rivals = [];

    for (let i = 0; i < 9; i++) {
        rivals.push({
            name: "IA " + (i + 1),
            power: Math.random() * 5 + 3
        });
    }

    let player = {
        name: "Vos",
        power: game.engine * 2 + game.aero
    };

    let all = [player, ...rivals];

    all.forEach(c => c.qualy = c.power + Math.random() * 5);

    all.sort((a, b) => b.qualy - a.qualy);

    game.grid = all;

    let html = "<h3>Clasificación</h3>";
    all.forEach((c, i) => {
        html += `<div class="row">${i + 1}. ${c.name}</div>`;
    });

    document.getElementById("grid").innerHTML = html;
}

// iniciar carrera
function startRace() {
    if (!game.grid.length) {
        alert("Primero clasificá");
        return;
    }

    goTo("raceTrack");

    let strategy = document.getElementById("strategy").value;

    let strat = {
        safe: 0.9,
        normal: 1,
        aggressive: 1.2
    };

    let cars = game.grid.map(c => ({
        name: c.name,
        progress: 0,
        speed: (c.power + Math.random() * 2) * strat[strategy]
    }));

    const layer = document.getElementById("carsLayer");
    layer.innerHTML = "";

    cars.forEach(car => {
        let el = document.createElement("div");
        el.className = "car";
        el.style.background = car.name === "Vos" ? "red" : "cyan";
        layer.appendChild(el);
        car.el = el;
    });

    let duration = 45000;
    let start = Date.now();

    let interval = setInterval(() => {
        let elapsed = Date.now() - start;

        cars.forEach(car => {
            car.progress += car.speed * 0.02;
        });

        cars.sort((a, b) => b.progress - a.progress);

        cars.forEach(car => {
            let t = car.progress % 100;
            let angle = (t / 100) * 2 * Math.PI;

            let x = 250 + 200 * Math.cos(angle);
            let y = 150 + 100 * Math.sin(angle);

            car.el.style.left = (x - 5) + "px";
            car.el.style.top = (y - 5) + "px";
        });

        let html = "<h3>Posiciones</h3>";
        cars.forEach((c, i) => {
            html += `<div>${i + 1}. ${c.name}</div>`;
        });

        document.getElementById("livePositions").innerHTML = html;

        if (elapsed >= duration) {
            clearInterval(interval);

            let pos = cars.findIndex(c => c.name === "Vos") + 1;

            let reward = (11 - pos) * 20;
            if (reward < 10) reward = 10;

            game.money += reward;

            alert("Terminaste " + pos + "° | $" + reward);

            goTo("menu");
        }

    }, 50);
}

// init
updateUI();