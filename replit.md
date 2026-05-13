# Motorsport Garage Tycoon

A browser-based idle/tycoon game where players manage a racing garage — repair cars, upgrade the team, sign sponsors, and compete in league championships.

## Run & Operate

- **Dev server:** `node server.js` (port 5000)
- **Requires:** `MONGODB_URI` environment variable (MongoDB Atlas — cluster `1rabase.llxhss4.mongodb.net`, DB `garage_motorsports`)
- **Start:** `npm start`

## Stack

- Vanilla HTML5 / CSS3 / JavaScript (ES6+) — frontend
- Node.js + Express 5 — backend API server
- Replit PostgreSQL — cloud saves & global leaderboard
- `pg` npm package for DB access

## File Structure

```
index.html              — main entry point
css/
  main.css              — all styling
js/
  core/
    gameState.js        — global `game` object (source of truth)
    saveSystem.js       — localStorage save/load (v3), migration support
    notifications.js    — toast system (notify / notifySuccess / notifyWarn / notifyInfo)
  systems/
    race.js             — qualifying, race loop, results, run_race()
    league.js           — standings, awardLeaguePoints(), calculate_league_points()
    workshop.js         — repair_car(), garage upgrades, workshop tick
    car.js              — tune_car(), dyno test, car part upgrades
    employees.js        — hire_mechanic(), mechanic catalog, getTotalMechanicSpeed()
    sponsors.js         — sponsor unlock/select
    progression.js      — addXP(), level-up
    offline.js          — applyOffline() idle earnings
  features/
    ftue.js             — FTUEManager: 6-step first-time user experience
    monetization.js     — AdsManager (4 rewarded ad hooks) + IAPManager (4 IAP hooks)
  app.js                — screen routing, dashboard, profile modal, init()
```

## Key Design Decisions

- **League bug fix:** `league` data was previously a standalone JS object (never saved). It is now part of `game.league` and fully persisted via localStorage.
- **Save key:** `mgt_save_v3` — migrates automatically from v1/v2 saves.
- **FTUE:** Controlled by `FTUEManager` in `js/features/ftue.js`. Steps 0–6 are tracked in `game.ftue`.
- **Ads/IAP:** Placeholder hooks in `js/features/monetization.js`. Replace `_showAdPlaceholder()` body with real AdMob/UnityAds SDK. Replace `IAPManager._fulfil()` with your store SDK.

## Game Loop

```
repair_car() → money + xp + reputation
tune_car()   → improves race pace
run_race()   → money + xp + league points (persisted in game.league + game.raceResults)
```

## Persistence Schema (localStorage `mgt_save_v3`)

```
game.playerName / game.garageName     — user profile
game.money / game.xp / game.level     — core economy
game.reputation                        — affects race pace
game.car.*                             — engine / transmission / aero / wheels (1-5)
game.workshop.*                        — bays, speed, queue, active
game.garageUpgrades.*                  — extraBay / speedBoost / partsStock
game.mechanics[]                       — hired NPC mechanics
game.league.standings[]                — persisted league points (THE BUG FIX)
game.raceResults[]                     — last 50 race results
game.medals / game.poleCount           — achievements
game.ftue                              — FTUE progress
game.iap                               — owned IAP products
```

## User Preferences

_Populate as you build_

## Future Features (hooks already in place)

- Rewarded Ads: `AdsManager.offer_ad_to_speed_repair()`, `offer_ad_double_race_reward()`, etc.
- IAP: `IAPManager.purchase('mechanic_premium_pack')`, `'garage_pro_upgrade'`, etc.
- FTUE: extend `FTUEManager` steps as new features are added
