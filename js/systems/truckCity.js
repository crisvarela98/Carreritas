// Mini-juego: Camión Ciudad (simulación ligera, segura para FTUE)
function runTruckCityGame() {
    notify("Camión Ciudad iniciado");

    // duración en segundos y premio por segundo
    const duration = 20;
    const rewardPerSecond = 50;
    let seconds = 0;
    let total = 0;

    const id = setInterval(() => {
        seconds++;
        game.money += rewardPerSecond;
        total += rewardPerSecond;

        // Notificar cada 5s para feedback ligero
        if (seconds % 5 === 0) {
            notify(`Camión: +$${total}`);
        }

        if (seconds >= duration) {
            clearInterval(id);
            notify(`Camión finalizado +$${total}`);
        }
    }, 1000);
}

// Exportar globalmente para invocación desde HTML/app
window.runTruckCityGame = runTruckCityGame;
