// ── Economy Module ────────────────────────────────────────────────
// Manages coins (money) and diamonds (premium), XP and level-up.

// ── Coins ─────────────────────────────────────────────────────────
function earn_coins(amount) {
    game.money += Math.max(0, Math.floor(amount));
}

function spend_coins(amount) {
    amount = Math.ceil(amount);
    if (game.money < amount) return false;
    game.money -= amount;
    return true;
}

// ── Diamonds ──────────────────────────────────────────────────────
function earn_diamonds(amount) {
    game.diamonds += Math.max(0, Math.floor(amount));
    notifyDiamond(`+${amount} 💎 Diamantes`);
}

function spend_diamonds(amount, onSuccess) {
    amount = Math.ceil(amount);
    if (game.diamonds < amount) {
        notifyWarn(`Necesitas ${amount} 💎 — tienes ${game.diamonds}`);
        return false;
    }
    game.diamonds -= amount;
    if (typeof onSuccess === "function") onSuccess();
    return true;
}

// ── XP & Level-up ─────────────────────────────────────────────────
function addXP(amount) {
    game.xp += amount;
    let need = game.level * 1000;

    while (game.xp >= need) {
        game.xp -= need;
        game.level++;

        // Level-up rewards
        earn_coins(1000);
        game.diamonds += 2;

        notifySuccess(`¡Nivel ${game.level}! +1000 💰 +2 💎`);
        checkSponsors();
        checkVehicleUnlocks();
        if (window.FTUEManager && FTUEManager.onLevelUp) FTUEManager.onLevelUp(game.level);

        need = game.level * 1000;
    }
}
