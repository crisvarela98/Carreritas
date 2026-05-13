// ── Monetization Hooks ────────────────────────────────────────────
// Replace _showAdPlaceholder / _runIAP bodies with real SDK calls.

const AdsManager = (() => {
    const _lastShown   = {};
    const COOLDOWN_MS  = 3 * 60 * 1000;

    function canOffer(slot) {
        return Date.now() - (_lastShown[slot] || 0) > COOLDOWN_MS;
    }
    function _markShown(slot) { _lastShown[slot] = Date.now(); }

    // ── Hook 1: Complete repair instantly via video ────────────────
    function offer_ad_to_speed_repair(carId) {
        _showAdPlaceholder("Completar reparación al instante", () => {
            const car = game.workshop.active.find(c => String(c.id) === String(carId));
            if (car) {
                // Complete repair instantly
                car.progress = car.duration;
            }
            notifySuccess("📺 ¡Reparación completada al instante!");
            _markShown("speed_repair");
        });
    }

    // ── Hook 2: Earn 2 diamonds from ad ──────────────────────────
    function offerRewardedAdToGetDiamonds() {
        _showAdPlaceholder("Ganar 2 Diamantes", () => {
            earn_diamonds(2);
            _markShown("earn_diamonds");
        });
    }

    // ── Hook 3: Double race reward ────────────────────────────────
    function offer_ad_double_race_reward() {
        const pending = RaceManager.state._pendingReward;
        if (!pending) {
            notifyInfo("📺 Disponible al terminar una carrera");
            return;
        }
        _showAdPlaceholder("Doblar recompensa de carrera", () => {
            earn_coins(pending.cash);
            addXP(pending.xp);
            RaceManager.state._pendingReward = null;
            notifySuccess(`📺 +$${pending.cash.toLocaleString()} extra!`);
            _markShown("double_race_reward");
        });
    }

    // ── Hook 4: Free garage slot (30 min) ────────────────────────
    function offer_ad_free_garage_slot() {
        _showAdPlaceholder("Bahía extra (30 min)", () => {
            game.workshop.capacity++;
            notifySuccess("📺 ¡Bahía extra por 30 min!");
            _markShown("free_garage_slot");
            setTimeout(() => {
                game.workshop.capacity = Math.max(
                    2 + (game.garageUpgrades.extraBay || 0),
                    game.workshop.capacity - 1
                );
            }, 30 * 60 * 1000);
        });
    }

    function _showAdPlaceholder(slotName, onReward) {
        const overlay = document.createElement("div");
        overlay.className = "ad-overlay";
        overlay.innerHTML = `
        <div class="ad-modal">
            <div class="ad-label">📺 ANUNCIO</div>
            <div class="ad-slot-name">${slotName}</div>
            <div class="ad-progress-wrap"><div class="ad-progress-bar" id="adBar"></div></div>
            <div class="ad-countdown" id="adCnt">5</div>
            <div class="ad-note">Mirá el anuncio completo para recibir tu recompensa</div>
        </div>`;
        document.body.appendChild(overlay);

        let secs = 5;
        const bar = overlay.querySelector("#adBar");
        const cnt = overlay.querySelector("#adCnt");
        const tick = setInterval(() => {
            secs--;
            if (cnt) cnt.textContent = secs;
            if (bar) bar.style.width = ((5 - secs) / 5 * 100) + "%";
            if (secs <= 0) { clearInterval(tick); overlay.remove(); onReward(); }
        }, 1000);
    }

    return { canOffer, offer_ad_to_speed_repair, offerRewardedAdToGetDiamonds, offer_ad_double_race_reward, offer_ad_free_garage_slot };
})();

// ── IAP Manager ───────────────────────────────────────────────────
const IAPManager = (() => {
    const PRODUCTS = {
        diamonds_small:          { label: "Pack Pequeño",    price: "$0.99", diamonds: 50 },
        diamonds_medium:         { label: "Pack Mediano",    price: "$2.99", diamonds: 200 },
        diamonds_large:          { label: "Pack Grande",     price: "$9.99", diamonds: 1000 },
        mechanic_premium_pack:   { label: "Ingeniero Pro",   price: "10 💎", diamonds: 0 },
        vehicle_upgrade_pack:    { label: "Pack Upgrades",   price: "$4.99", diamonds: 0, coins: 50000 },
        garage_pro_upgrade:      { label: "Garage Pro",      price: "$9.99", diamonds: 0, unlockAll: true }
    };

    function isOwned(productId) { return !!(game.iap && game.iap[productId]); }

    function purchaseDiamondsPack(productId) {
        const p = PRODUCTS[productId];
        if (!p) return;
        _runIAP(p, () => {
            if (p.diamonds) earn_diamonds(p.diamonds);
            if (p.coins)    earn_coins(p.coins);
            if (p.unlockAll) {
                Object.keys(game.garageUpgrades).forEach(k => {
                    const def = GARAGE_UPGRADES_DEF.find(d => d.key === k);
                    if (def) game.garageUpgrades[k] = def.max;
                });
                game.workshop.capacity = 5;
                game.workshop.speed    = 3;
                notifySuccess("💎 Garage Pro desbloqueado!");
            }
            game.iap[productId] = true;
            save_user_progress();
        });
    }

    function purchaseVehicleUpgradePack() { purchaseDiamondsPack("vehicle_upgrade_pack"); }

    function _runIAP(product, onSuccess) {
        const overlay = document.createElement("div");
        overlay.className = "ad-overlay";
        overlay.innerHTML = `
        <div class="ad-modal">
            <div class="ad-label">💎 COMPRA</div>
            <div class="ad-slot-name">${product.label}</div>
            <div class="ad-price">${product.price}</div>
            <div class="iap-btn-row">
                <button class="rbtn accent-btn" id="iapOk">Comprar (simulado)</button>
                <button class="rbtn" id="iapNo">Cancelar</button>
            </div>
            <div class="ad-note">SDK Placeholder — integra tu tienda aquí</div>
        </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector("#iapNo").addEventListener("click", () => overlay.remove());
        overlay.querySelector("#iapOk").addEventListener("click", () => { overlay.remove(); onSuccess(); });
    }

    return { isOwned, purchaseDiamondsPack, purchaseVehicleUpgradePack, PRODUCTS };
})();

window.AdsManager  = AdsManager;
window.IAPManager  = IAPManager;
