# Motorsport Garage Tycoon

A browser-based idle/tycoon game where you manage a racing garage, repair customer cars, unlock race vehicles, and compete in multiple leagues simultaneously.

---

## Quick Start

```
npx --yes serve -s . -l 5000
```

No backend. No environment variables. All persistence via `localStorage`.

---

## Game Flow

### Level Progression

| Level | Unlock |
|-------|--------|
| 1     | Auto de Taller + Car League |
| 2     | Sponsor Starter unlocks |
| 15    | 🏍 Moto de Carreras + Moto League |
| 30    | 🚙 Camioneta Rally + Rally League |
| 50    | 🏎 Monoplaza Fórmula + Formula League |

Each level-up awards: **+1,000 Monedas + 2 Diamantes**

### Core Loop

```
Taller: repair customer cars → earn coins + XP
Vehículos tab: spend coins → upgrade your race vehicles
Carreras: select vehicle → qualifying → race → earn coins + XP + league points
Liga: accumulate points per vehicle → championship standings
```

---

## Vehicle System

Four vehicle types, each with its own league, stats, and rival set:

| Vehicle     | Icon | Level | Base Pace | HP   | Torque | CV   |
|-------------|------|-------|-----------|------|--------|------|
| Auto        | 🚗   | 1     | 92s/lap   | 350  | 476 Nm | 355  |
| Moto        | 🏍   | 15    | 65s/lap   | 200  | 120 Nm | 203  |
| Rally       | 🚙   | 30    | 105s/lap  | 450  | 610 Nm | 456  |
| Fórmula     | 🏎   | 50    | 80s/lap   | 1000 | 400 Nm | 1014 |

Stats are computed dynamically from upgrade levels.

---

## Upgrade System

Each vehicle has 5 upgradeable parts (max level 5 each):

| Part        | Icon | Pace Reduction | Notes |
|-------------|------|----------------|-------|
| Motor       | ⚙️   | -2.0s per level | Primary performance |
| Turbo       | 💨   | -1.5s per level | Starts locked (costs extra to unlock) |
| Frenos      | 🛑   | -0.8s per level | Braking and control |
| Neumáticos  | 🛞   | -1.2s per level | Grip and corner speed |
| Suspensión  | 🔩   | -0.6s per level | Stability |

Upgrade costs scale exponentially per vehicle tier (Car < Moto < Rally < Fórmula).

---

## League System

### LeagueManager

Each vehicle has its own independent league (`game.leagues.car`, `game.leagues.moto`, etc.).

Standings persist across sessions — the old bug where `league` lived outside `game` is fixed.

```js
LeagueManager.init(vehicleId)         // Populate standings with rivals
LeagueManager.add_league_points(vehicleId, standings)  // After each race
LeagueManager.getStandings(vehicleId) // Sorted array
LeagueManager.getPlayerRank(vehicleId)
LeagueManager.getPlayerPoints(vehicleId)
```

### PointsCalculator

F1-style points: `[25, 18, 15, 12, 10, 8, 6, 4, 2, 1]`

```js
PointsCalculator.forPosition(pos)  // Returns points for position
```

### Championships

Start 3, 5, or 10-race series from the Liga screen. Points accumulate across all races in the series.

---

## Economy

### Dual Currency

| Currency    | Earn | Spend |
|-------------|------|-------|
| 💰 Monedas  | Repair cars, win races, level-up (+1000) | Upgrades, hiring, garage improvements |
| 💎 Diamantes | Level-up (+2), rewarded ads (+3), IAP | Premium mechanics, exclusive items |

### Balance

- Workshop car reward: **$30–150** (intentionally small — grind is the loop)
- Race win reward: **$1,200** (1st), $700 (2nd), $450 (3rd), scaling down
- Offline earnings: **$0.20/second**, capped at **2 hours** ($720 max)

```js
earn_coins(amount)
spend_coins(amount)   // returns false if insufficient
earn_diamonds(amount)
spend_diamonds(amount, onSuccess)
addXP(amount)         // triggers level-up chain automatically
```

---

## Race System (RaceManager)

```js
RaceManager.start(vehicleId, mode)         // Quick race
RaceManager.startLeague(vehicleId, n)      // League championship (3/5/10 races)
```

Race phases: `menu → qualy → grid → racing → result`

Player pace is calculated from `getVehiclePace(vehicleId)` which factors in all upgrade levels, reputation, sponsor bonus, and mechanic skill.

---

## Persistence

Save key: `mgt_save_v4`  
Auto-saves every 5 seconds.  
Migrates automatically from v1/v2/v3 saves.

```js
save_user_progress()   // manual save
load_user_progress()   // called on init, includes migration
resetGame()            // prompts confirmation, clears localStorage
```

---

## Monetization Hooks

### Rewarded Ads (AdsManager)

```js
AdsManager.offer_ad_to_speed_repair(carId)     // +50% progress on a repair
AdsManager.offerRewardedAdToGetDiamonds()       // +3 💎
AdsManager.offer_ad_double_race_reward()        // ×2 race cash
AdsManager.offer_ad_free_garage_slot()          // +1 bay for 30 min
```

Replace `_showAdPlaceholder()` body with AdMob / UnityAds SDK call.

### IAP (IAPManager)

```js
IAPManager.purchaseDiamondsPack('diamonds_small')   // $0.99 → +50 💎
IAPManager.purchaseDiamondsPack('diamonds_medium')  // $2.99 → +200 💎
IAPManager.purchaseDiamondsPack('diamonds_large')   // $9.99 → +1000 💎
IAPManager.purchaseVehicleUpgradePack()             // $4.99 → +$20K coins
```

Replace `_runIAP()` body with your store SDK (Google Play / App Store).

---

## Module Map

```
js/
  core/
    gameState.js        Global `game` object
    saveSystem.js       localStorage v4 with migration
    notifications.js    Toast system (5 types)
  modules/
    economy.js          earn/spend coins & diamonds, addXP, level-up
    vehicles.js         VEHICLE_CATALOG, VEHICLE_RIVALS, pace calculation
    upgrades.js         upgrade_vehicle(), getUpgradeCost(), renderVehiclesTab()
    leagues.js          LeagueManager, PointsCalculator, renderLeague()
    races.js            RaceManager (qualy → grid → race → result)
    workshop.js         Customer car repair loop, garage upgrades
    employees.js        hire_mechanic(), fireMechanic(), renderEmployees()
    sponsors.js         checkSponsors(), selectSponsor(), renderSponsors()
    offline.js          applyOffline() — balanced passive income
  features/
    ftue.js             FTUEManager — 4-step guided tutorial
    monetization.js     AdsManager + IAPManager placeholder hooks
  app.js                showScreen(), renderDashboard(), init()
css/
  main.css              Full UI — dark theme, vehicle accent colors, responsive
index.html              Script load order, screen structure, header currency HUD
```
