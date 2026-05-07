function addXP(amount) {
    game.xp += amount;

    let need = game.level * 1000;

    while (game.xp >= need) {
        game.xp -= need;
        game.level++;
        notify("¡Nivel " + game.level + "! 🎉", "success");
        checkSponsors();
        need = game.level * 1000;
    }
}
