function applyOffline() {
    const now = Date.now();
    const sec = (now - game.lastTime) / 1000;

    if (sec > 10) {
        const gain = Math.floor(sec * 5);
        game.money += gain;
        notifyInfo(`Offline: +$${gain.toLocaleString()} ganados mientras estabas fuera`);
    }

    game.lastTime = now;
}
