// ── Monetization Module ───────────────────────────────────────────
// Placeholder hooks for Rewarded Ads (AdMob / UnityAds) and IAP.
// Replace the body of each function with real SDK calls when ready.

// ─────────────────────────────────────────────────────────────────
// REWARDED ADS
// ─────────────────────────────────────────────────────────────────
const AdsManager = (() => {

    // Track when an ad was last shown per slot (prevent spam)
    const _lastShown = {};
    const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes per slot

    function canOffer(slot) {
        const last = _lastShown[slot] || 0;
        return Date.now() - last > COOLDOWN_MS;
    }

    function _markShown(slot) {
        _lastShown[slot] = Date.now();
    }

    // ── Hook 1: Speed up a repair by 50% ─────────────────────────
    function offer_ad_to_speed_repair(carId) {
        _showAdPlaceholder("Repair Speed Boost", () => {
            const car = game.workshop.active.find(c => String(c.id) === String(carId));
            if (!car) return;
            car.progress += car.duration * 0.5;
            notify("📺 ¡Reparación acelerada al 50%!", "success");
            _markShown("speed_repair");
        });
    }

    // ── Hook 2: Instantly source a missing part ───────────────────
    function offer_ad_for_missing_part(partKey, callback) {
        _showAdPlaceholder("Missing Part Unlock", () => {
            notify("📺 ¡Pieza obtenida gratis!", "success");
            _markShown("missing_part");
            if (typeof callback === "function") callback();
        });
    }

    // ── Hook 3: Double race reward ────────────────────────────────
    function offer_ad_double_race_reward() {
        if (!raceState._pendingReward) return;
        const { cash, xp } = raceState._pendingReward;
        _showAdPlaceholder("Double Race Reward", () => {
            game.money += cash;
            addXP(xp);
            raceState._pendingReward = null;
            notify(`📺 ¡Recompensa doblada! +$${cash.toLocaleString()} extra`, "success");
            _markShown("double_race_reward");
        });
    }

    // ── Hook 4: Unlock a free extra garage slot (30 min) ─────────
    function offer_ad_free_garage_slot() {
        _showAdPlaceholder("Free Garage Slot", () => {
            game.workshop.capacity++;
            notify("📺 ¡Bahía extra desbloqueada por 30 min!", "success");
            _markShown("free_garage_slot");
            setTimeout(() => {
                game.workshop.capacity = Math.max(
                    2 + (game.garageUpgrades.extraBay || 0),
                    game.workshop.capacity - 1
                );
            }, 30 * 60 * 1000);
        });
    }

    // ── Internal: shows a simulated ad placeholder ────────────────
    // Replace this entire function body with your real SDK call.
    function _showAdPlaceholder(slotName, onReward) {
        const overlay = document.createElement("div");
        overlay.className = "ad-overlay";
        overlay.innerHTML = `
            <div class="ad-modal">
                <div class="ad-label">📺 ANUNCIO</div>
                <div class="ad-slot-name">${slotName}</div>
                <div class="ad-progress-wrap">
                    <div class="ad-progress-bar" id="adProgressBar"></div>
                </div>
                <div class="ad-countdown" id="adCountdown">5</div>
                <div class="ad-note">SDK Placeholder — integra AdMob / UnityAds aquí</div>
            </div>
        `;
        document.body.appendChild(overlay);

        let secs = 5;
        const bar = overlay.querySelector("#adProgressBar");
        const cnt = overlay.querySelector("#adCountdown");

        const tick = setInterval(() => {
            secs--;
            if (cnt) cnt.textContent = secs;
            if (bar) bar.style.width = ((5 - secs) / 5 * 100) + "%";
            if (secs <= 0) {
                clearInterval(tick);
                overlay.remove();
                onReward();
            }
        }, 1000);
    }

    return {
        canOffer,
        offer_ad_to_speed_repair,
        offer_ad_for_missing_part,
        offer_ad_double_race_reward,
        offer_ad_free_garage_slot
    };
})();


// ─────────────────────────────────────────────────────────────────
// IN-APP PURCHASES
// ─────────────────────────────────────────────────────────────────
const IAPManager = (() => {

    const PRODUCTS = {
        mechanic_premium_pack: {
            id:    "mechanic_premium_pack",
            label: "Pack Mecánico Premium",
            price: "$4.99",
            desc:  "Desbloquea al Ingeniero F1 permanentemente"
        },
        extra_lift_pack: {
            id:    "extra_lift_pack",
            label: "Pack Elevadores Extra",
            price: "$1.99",
            desc:  "+2 bahías de trabajo permanentes"
        },
        rare_parts_pack: {
            id:    "rare_parts_pack",
            label: "Pack Repuestos Raros",
            price: "$2.99",
            desc:  "50% más probabilidad de autos raros por 7 días"
        },
        garage_pro_upgrade: {
            id:    "garage_pro_upgrade",
            label: "Garage Pro",
            price: "$9.99",
            desc:  "Desbloquea todas las mejoras del garage al máximo"
        }
    };

    // Local ownership state (persisted in game.iap)
    function _getOwned() {
        if (!game.iap) game.iap = {};
        return game.iap;
    }

    function isOwned(productId) {
        return !!_getOwned()[productId];
    }

    // ── purchase(): replace body with real store SDK call ─────────
    function purchase(productId, onSuccess) {
        const product = PRODUCTS[productId];
        if (!product) return;

        // --- Placeholder flow ---
        const overlay = document.createElement("div");
        overlay.className = "ad-overlay";
        overlay.innerHTML = `
            <div class="ad-modal">
                <div class="ad-label">💎 COMPRA IN-APP</div>
                <div class="ad-slot-name">${product.label}</div>
                <div class="ad-note">${product.desc}</div>
                <div class="ad-price">${product.price}</div>
                <div class="iap-btn-row">
                    <button class="rbtn accent-btn" id="iapConfirm">Comprar (simulado)</button>
                    <button class="rbtn" id="iapCancel">Cancelar</button>
                </div>
                <div class="ad-note" style="margin-top:8px">SDK Placeholder — integra tu tienda aquí</div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector("#iapCancel").addEventListener("click", () => overlay.remove());
        overlay.querySelector("#iapConfirm").addEventListener("click", () => {
            overlay.remove();
            _fulfil(productId, onSuccess);
        });
    }

    function _fulfil(productId, onSuccess) {
        _getOwned()[productId] = true;
        save_user_progress();
        notify("💎 Compra completada: " + PRODUCTS[productId].label, "success");
        if (typeof onSuccess === "function") onSuccess();
    }

    function getProducts() { return PRODUCTS; }

    return { purchase, isOwned, getProducts };
})();
