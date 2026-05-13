# 🏎 Motorsport Garage Tycoon

Un juego idle/tycoon de navegador donde administrás un garaje de carreras: reparás autos, mejorás el equipo, firmás sponsors y competís en campeonatos de liga.

## ▶ Cómo ejecutar

- **Servidor de desarrollo:** `node server.js` (puerto 5000)
- **Requisito:** variable de entorno `DATABASE_URL` (PostgreSQL de Replit, se provisiona automáticamente)
- **Inicio:** `npm start`

## 🛠 Tecnología

- HTML5 / CSS3 / JavaScript (ES6+) — frontend vanilla
- Node.js + Express 5 — servidor API
- PostgreSQL de Replit — guardado en la nube y ranking global
- Paquete `pg` para acceso a la base de datos

## 📁 Estructura de archivos

```
index.html              — punto de entrada principal
css/
  main.css              — todos los estilos
js/
  core/
    gameState.js        — objeto global `game` (fuente de verdad)
    saveSystem.js       — guardado/carga localStorage (v4), migración automática
    cloudSave.js        — sincronización con servidor (sin badge molesto offline)
    notifications.js    — sistema de toasts
  modules/
    races.js            — motor de carrera con tiempos acumulativos, liga trackday
    leagues.js          — standings y puntos de liga por vehículo
    workshop.js         — repair_car(), mejoras de garage, tick del taller
    vehicles.js         — catálogo de vehículos, rivales trackday, getVehiclePace()
    employees.js        — mecánicos agrupados por tipo, velocidad capeada
    sponsors.js         — sponsors, desbloqueo por nivel
    economy.js          — addXP(), earn_coins(), earn_diamonds()
    offline.js          — applyOffline() — $2/seg idle
    minigame.js         — MiniGame: camión ciudad $150/seg
    tasks.js            — tareas diarias y súper tareas
    upgrades.js         — mejoras de vehículo (renderVehiclesTab)
  features/
    ftue.js             — FTUEManager: 5 pasos + botón flotante Tata Lion
    monetization.js     — AdsManager (video completa reparación, +2💎) + IAPManager
  app.js                — routing, perfil v1.0, leaderboard extendido, init()
```

## 🎮 Loop del juego

```
repair_car()  →  dinero + xp + reputación
tune_car()    →  mejora ritmo de carrera
run_race()    →  dinero + xp + puntos de liga (en game.leagues)
minigame()    →  $150/seg en el camión ciudad
```

## 🏁 Balanceo de carreras

| Liga      | Estilo            | Neumáticos | Pit Stop | Notas                        |
|-----------|-------------------|------------|----------|------------------------------|
| Auto 🚗   | Trackday amigable | No         | No       | Rivales lentos, ideal inicio |
| Moto 🏍   | Competitivo       | No         | No       | Buena velocidad              |
| Rally 🚙  | Etapas especiales | No         | No       | Eventos de clima aleatorios  |
| Fórmula 🏎| Técnico           | Sí         | Sí       | Pit stop obligatorio         |

**Motor de carrera:** Usa tiempos **acumulativos** — la pole position se mantiene realista. Bug de pole→último lugar corregido.

**Car League Trackday:** Rivales con basePace 101–109s (el jugador empieza en 92s) → puede ganar sin upgrades para engancharse.

## 👷 Mecánicos

| Tipo           | Velocidad | Tiempo auto simple | Máx. slots | Costo     |
|----------------|-----------|--------------------|-----------|-----------|
| Junior 🔧      | 0.8/s     | ~7 min solo        | 6         | $600      |
| Senior ⚙️      | 2.5/s     | ~4 min solo        | 4         | $2,500    |
| Experto 🛠     | 5.5/s     | ~2.5 min solo      | 3         | $8,000    |
| Ingeniero Pro 🏎| 9.0/s    | ~90s solo          | 2         | 10 💎     |

**Velocidad total máxima:** 18/s (tiempo mínimo de reparación ~20s en auto simple)  
**Agrupados en un slot por tipo** en la pantalla de Staff (ej: "Mecánico Junior ×3")

## 🚗 Tiempos de reparación

| Auto        | Duración base | Ver video       |
|-------------|---------------|-----------------|
| Simple 🚗   | 6 minutos     | Completa al instante |
| Estrella ⭐ | 15 minutos    | Completa al instante |

## 💰 Economía mejorada

| Fuente              | Ingresos                          |
|---------------------|-----------------------------------|
| Reparación simple   | $600–$800                         |
| Reparación estrella | $1,800–$2,400                     |
| Victoria (1er)      | $4,500                            |
| 2do / 3er lugar     | $2,800 / $1,800                   |
| Minijuego           | $150/seg → $4,500 en 30 segundos  |
| Offline             | $2/seg → hasta $28,800 en 4 horas |
| Ver anuncio         | +2 💎 por video                   |
| Subir nivel         | +1,000 💰 +2 💎                   |

## 📺 Publicidad y microtransacciones

```js
// Anuncios recompensados
AdsManager.offer_ad_to_speed_repair(carId)  // Completa reparación AL INSTANTE
AdsManager.offerRewardedAdToGetDiamonds()   // +2 💎
AdsManager.offer_ad_double_race_reward()    // ×2 recompensa de carrera
AdsManager.offer_ad_free_garage_slot()      // +1 bahía por 30 min

// IAP (simulados, reemplazar con SDK de tienda)
IAPManager.purchaseDiamondsPack('diamonds_small')    // $0.99 → +50 💎
IAPManager.purchaseDiamondsPack('diamonds_medium')   // $2.99 → +200 💎
IAPManager.purchaseDiamondsPack('diamonds_large')    // $9.99 → +1000 💎
IAPManager.purchaseVehicleUpgradePack()              // $4.99 → +$50K
```

## 🌍 Ranking Global

El ranking muestra los **100 mejores jugadores** con:
- Nivel, XP, Victorias por tipo de vehículo (🚗🏍🚙🏎), Pole Positions, Reparaciones

**Requiere conexión al servidor de Replit.** Jugando desde GitHub Pages solo guarda localmente.

## 📋 FTUE — Tutorial Tata Lion (5 pasos)

| Paso | Trigger                     | Mensaje de Tata Lion                  |
|------|-----------------------------|---------------------------------------|
| 1    | Perfil guardado             | Recibí tu primer auto                 |
| 2    | Primer auto recibido        | ¡Ahora a correr!                      |
| 3    | Primera carrera completada  | ¡Contratá un mecánico!                |
| 4    | Primer mecánico contratado  | ¿Para qué sirve el camión? 🚛         |
| 5    | Minijuego iniciado          | ¡Mejorá tu auto de carrera!           |
| ✅   | Tutorial completo           | Botón flotante 🦁 con tips adicionales|

## 🗄️ Esquema de persistencia (`mgt_save_v4`)

```
game.playerName / game.garageName
game.money / game.xp / game.level / game.diamonds
game.reputation
game.vehicles.{car|moto|rally|formula}.upgrades.*
game.workshop.{speed, capacity, queue[], active[]}
game.garageUpgrades.{speedBoost, partsStock}
game.mechanics[]
game.leagues.{car|moto|rally|formula}.{standings[], currentRace}
game.raceResults[]           — últimas 50 carreras
game.medals / game.poleCount
game.stats.{totalWins, wins_car, wins_moto, wins_rally, wins_formula, totalPoles, totalRepairs}
game.ftue.{completed, step}
game.iap
```

## 📊 Columnas del ranking global (PostgreSQL)

```sql
device_id, player_name, garage_name,
level, xp,
total_wins, wins_car, wins_moto, wins_rally, wins_formula,
total_poles, total_repairs, total_coins,
updated_at
```

## 🔮 Progresión por nivel

| Nivel | Desbloqueo                          |
|-------|-------------------------------------|
| 1     | Auto de Taller + Liga Auto          |
| 2     | Primeros sponsors                   |
| 5     | Tip: ¡conseguí un sponsor!          |
| 10    | Tip: ¡mejorá el taller!             |
| 15    | 🏍 Moto de Carreras + Liga Moto     |
| 20    | Tip: ¡completá tus tareas!          |
| 30    | 🚙 Camioneta Rally + Liga Rally     |
| 50    | 🏎 Monoplaza Fórmula + Liga Fórmula |

Cada nivel da: **+1,000 💰 + 2 💎**

## ✏️ Preferencias del usuario

- Idioma de UI: **Español**
- Estilo de carreras: Trackday amigable para nuevos jugadores (Liga Autos)
- Tiempos de reparación: Realistas (6 min simple, 15 min estrella)
- Mecánicos: Agrupados por tipo en la UI
- Badge offline: Solo aparece 1 vez por sesión (no molesta)
