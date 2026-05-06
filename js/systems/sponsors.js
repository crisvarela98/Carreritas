const sponsors = [
    { level:3, name:"Starter", color:"gray", money:1.1 },
    { level:10, name:"Turbo", color:"blue", money:1.2 },
    { level:25, name:"Nitro", color:"purple", money:1.4 },
    { level:50, name:"Hyper", color:"orange", money:1.7 },
    { level:100, name:"Apex", color:"red", money:2 }
];

function checkSponsors() {
    sponsors.forEach(s=>{
        if(game.level>=s.level && !game.sponsorsUnlocked.includes(s.name)){
            game.sponsorsUnlocked.push(s.name);
            notify("Sponsor desbloqueado: "+s.name);
        }
    });
}

function selectSponsor(name){
    game.sponsor = sponsors.find(s=>s.name===name);
    notify("Sponsor activo: "+name);
    renderSponsors();
}

function renderSponsors(){
    let html = `<div class="panel">Nivel ${game.level}</div>`;

    sponsors.forEach(s=>{
        if(game.sponsorsUnlocked.includes(s.name)){
            html += `<div class="panel" style="border-left:5px solid ${s.color}">
                ${s.name}
                <button onclick="selectSponsor('${s.name}')">Elegir</button>
            </div>`;
        }
    });

    sponsorsContent.innerHTML = html;
}