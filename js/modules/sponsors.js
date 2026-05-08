// ── Sponsors Module ───────────────────────────────────────────────

const SPONSORS_LIST = [
    { level: 3,   name: "Starter",  color: "#64748b", money: 1.1, desc: "Primer sponsor — bono pequeño" },
    { level: 10,  name: "Turbo",    color: "#3b82f6", money: 1.2, desc: "Bono moderado por reparación" },
    { level: 25,  name: "Nitro",    color: "#a855f7", money: 1.4, desc: "Buen bono para talleres activos" },
    { level: 50,  name: "Hyper",    color: "#f97316", money: 1.7, desc: "Recompensas generosas" },
    { level: 100, name: "Apex",     color: "#e11d48", money: 2.0, desc: "El mejor del mercado" }
];

function checkSponsors() {
    SPONSORS_LIST.forEach(s => {
        if (game.level >= s.level && !game.sponsorsUnlocked.includes(s.name)) {
            game.sponsorsUnlocked.push(s.name);
            notify("🤝 Sponsor desbloqueado: " + s.name, "success");
        }
    });
}

function selectSponsor(name) {
    game.sponsor = SPONSORS_LIST.find(s => s.name === name) || null;
    if (game.sponsor) notifySuccess("Sponsor activo: " + name);
    renderSponsors();
}

function renderSponsors() {
    const el = document.getElementById("sponsorsContent");
    if (!el) return;

    const unlocked = SPONSORS_LIST.filter(s => game.sponsorsUnlocked.includes(s.name));
    const locked   = SPONSORS_LIST.filter(s => !game.sponsorsUnlocked.includes(s.name));

    const unlockedHtml = unlocked.length === 0
        ? `<div class="empty-row">Llega al Nivel 3 para tu primer sponsor</div>`
        : unlocked.map(s => {
            const active = game.sponsor && game.sponsor.name === s.name;
            return `
            <div class="sponsor-card ${active ? "sponsor-active" : ""}" style="border-left:4px solid ${s.color}">
                <div class="spc-left">
                    <div class="spc-name">${s.name}</div>
                    <div class="spc-desc">${s.desc}</div>
                    <div class="spc-bonus">Bono ×${s.money}</div>
                </div>
                <button class="rbtn ${active ? "" : "accent-btn"} spc-btn"
                        onclick="selectSponsor('${s.name}')"
                        ${active ? "disabled" : ""}>
                    ${active ? "✅ Activo" : "Elegir"}
                </button>
            </div>`;
        }).join("");

    const lockedHtml = locked.map(s => `
        <div class="sponsor-card sponsor-locked">
            <div class="spc-left">
                <div class="spc-name">🔒 ${s.name}</div>
                <div class="spc-desc">Desbloquea en Nivel ${s.level}</div>
                <div class="spc-bonus">Bono ×${s.money}</div>
            </div>
        </div>`).join("");

    el.innerHTML = `
    <div class="race-card">
        <div class="race-hero-title">🤝 SPONSORS</div>
        <div class="sponsor-level-bar">
            <span>Nivel: <strong>${game.level}</strong></span>
            ${game.sponsor ? `<span style="color:${game.sponsor.color}">▶ ${game.sponsor.name} ×${game.sponsor.money}</span>` : ""}
        </div>
    </div>
    <div class="race-card">
        <div class="race-divider">DISPONIBLES</div>${unlockedHtml}
    </div>
    ${locked.length ? `<div class="race-card"><div class="race-divider">PRÓXIMOS</div>${lockedHtml}</div>` : ""}`;
}
