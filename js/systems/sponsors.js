const sponsors = [
    { level: 3,   name: "Starter", color: "gray",   money: 1.1 },
    { level: 10,  name: "Turbo",   color: "blue",   money: 1.2 },
    { level: 25,  name: "Nitro",   color: "purple", money: 1.4 },
    { level: 50,  name: "Hyper",   color: "orange", money: 1.7 },
    { level: 100, name: "Apex",    color: "red",    money: 2   }
];

function checkSponsors() {
    sponsors.forEach(s => {
        if (game.level >= s.level && !game.sponsorsUnlocked.includes(s.name)) {
            game.sponsorsUnlocked.push(s.name);
            notify("Sponsor desbloqueado: " + s.name);
        }
    });
}

function selectSponsor(name) {
    game.sponsor = sponsors.find(s => s.name === name) || null;
    if (game.sponsor) notify("Sponsor activo: " + name);
    renderSponsors();
}

function renderSponsors() {
    const sponsorsContent = document.getElementById("sponsorsContent");
    if (!sponsorsContent) return;

    let html = `<div class="panel"><p>Nivel ${game.level} — sube de nivel reparando autos y corriendo carreras para desbloquear sponsors.</p></div>`;

    const unlocked = sponsors.filter(s => game.sponsorsUnlocked.includes(s.name));

    if (unlocked.length === 0) {
        html += `<div class="panel"><p>Aún no tienes sponsors desbloqueados. Alcanza el nivel 3 para el primero.</p></div>`;
    }

    unlocked.forEach(s => {
        const active = game.sponsor && game.sponsor.name === s.name;
        html += `<div class="panel" style="border-left:5px solid ${s.color}">
            <strong>${s.name}</strong> — bono x${s.money}
            <button onclick="selectSponsor('${s.name}')" ${active ? "disabled" : ""}>${active ? "Activo" : "Elegir"}</button>
        </div>`;
    });

    sponsorsContent.innerHTML = html;
}
