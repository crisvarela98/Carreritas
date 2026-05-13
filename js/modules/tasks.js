// ── Daily Task Pool ───────────────────────────────────────────────
const DAILY_TASK_POOL = [
    { id: 'rep3',       icon: '🔧', desc: 'Reparar 3 vehículos',             type: 'repair',        target: 3,    reward: { coins: 600,  xp: 60  } },
    { id: 'rep5',       icon: '🔧', desc: 'Reparar 5 vehículos',             type: 'repair',        target: 5,    reward: { coins: 900,  xp: 90  } },
    { id: 'rep10',      icon: '🔧', desc: 'Reparar 10 vehículos',            type: 'repair',        target: 10,   reward: { coins: 1500, xp: 150 } },
    { id: 'race1',      icon: '🏁', desc: 'Correr 1 carrera',                type: 'race',          target: 1,    reward: { coins: 400,  xp: 40  } },
    { id: 'race3',      icon: '🏁', desc: 'Correr 3 carreras',               type: 'race',          target: 3,    reward: { coins: 900,  xp: 90  } },
    { id: 'win1',       icon: '🥇', desc: 'Ganar 1 carrera',                 type: 'win',           target: 1,    reward: { coins: 700,  xp: 80  } },
    { id: 'pole1',      icon: '🟣', desc: 'Conseguir 1 pole position',       type: 'pole',          target: 1,    reward: { coins: 500,  xp: 70  } },
    { id: 'coins2k',    icon: '💰', desc: 'Ganar $2000 en carreras',         type: 'raceCoins',     target: 2000, reward: { coins: 500,  xp: 50  } },
    { id: 'coins5k',    icon: '💰', desc: 'Ganar $5000 en carreras',         type: 'raceCoins',     target: 5000, reward: { coins: 1000, xp: 100 } },
    { id: 'mg1',        icon: '🚛', desc: 'Jugar 1 vez el minijuego',        type: 'minigame',      target: 1,    reward: { coins: 300,  xp: 30  } },
    { id: 'win3',       icon: '🥇', desc: 'Ganar 3 carreras',                type: 'win',           target: 3,    reward: { coins: 1200, xp: 120 } },
    { id: 'pole3',      icon: '🟣', desc: 'Conseguir 3 poles',               type: 'pole',          target: 3,    reward: { coins: 800,  xp: 100 } },
    { id: 'upcar1',     icon: '⚙️', desc: 'Mejorar 1 pieza del auto',        type: 'upgradecar',    target: 1,    reward: { coins: 500,  xp: 60  } },
    { id: 'upcar3',     icon: '⚙️', desc: 'Mejorar 3 piezas del auto',       type: 'upgradecar',    target: 3,    reward: { coins: 1200, xp: 130 } },
    { id: 'upgarage1',  icon: '🏗',  desc: 'Mejorar 1 mejora del garage',    type: 'upgradegarage', target: 1,    reward: { coins: 600,  xp: 70  } },
    { id: 'upstaff1',   icon: '👷', desc: 'Contratar 1 mecánico',            type: 'hirestaff',     target: 1,    reward: { coins: 800,  xp: 80  } },
];

// ── Super Tasks (milestones — permanent, give diamonds) ───────────
const SUPER_TASKS = [
    { id: 'sr30',    icon: '🔧', group: 'Taller',     desc: 'Preparar 30 vehículos',          type: 'totalRepair', target: 30,    reward: { diamonds: 5   } },
    { id: 'sr90',    icon: '🔧', group: 'Taller',     desc: 'Preparar 90 vehículos',          type: 'totalRepair', target: 90,    reward: { diamonds: 10  } },
    { id: 'sr150',   icon: '🔧', group: 'Taller',     desc: 'Preparar 150 vehículos',         type: 'totalRepair', target: 150,   reward: { diamonds: 15  } },
    { id: 'sr300',   icon: '🔧', group: 'Taller',     desc: 'Preparar 300 vehículos',         type: 'totalRepair', target: 300,   reward: { diamonds: 25  } },
    { id: 'sr600',   icon: '🔧', group: 'Taller',     desc: 'Preparar 600 vehículos',         type: 'totalRepair', target: 600,   reward: { diamonds: 40  } },
    { id: 'sr1500',  icon: '🔧', group: 'Taller',     desc: 'Preparar 1500 vehículos',        type: 'totalRepair', target: 1500,  reward: { diamonds: 60  } },
    { id: 'sw1',     icon: '🥇', group: 'Carreras',   desc: 'Ganar 1 carrera',                type: 'totalWin',    target: 1,     reward: { diamonds: 3   } },
    { id: 'sw5',     icon: '🥇', group: 'Carreras',   desc: 'Ganar 5 carreras',               type: 'totalWin',    target: 5,     reward: { diamonds: 8   } },
    { id: 'sw25',    icon: '🥇', group: 'Carreras',   desc: 'Ganar 25 carreras',              type: 'totalWin',    target: 25,    reward: { diamonds: 20  } },
    { id: 'sw100',   icon: '🥇', group: 'Carreras',   desc: 'Ganar 100 carreras',             type: 'totalWin',    target: 100,   reward: { diamonds: 50  } },
    { id: 'sp1',     icon: '🟣', group: 'Carreras',   desc: 'Conseguir 1 pole',               type: 'totalPole',   target: 1,     reward: { diamonds: 2   } },
    { id: 'sp10',    icon: '🟣', group: 'Carreras',   desc: 'Conseguir 10 poles',             type: 'totalPole',   target: 10,    reward: { diamonds: 15  } },
    { id: 'sp50',    icon: '🟣', group: 'Carreras',   desc: 'Conseguir 50 poles',             type: 'totalPole',   target: 50,    reward: { diamonds: 35  } },
    { id: 'sl10',    icon: '⭐', group: 'Progresión', desc: 'Alcanzar nivel 10',              type: 'level',       target: 10,    reward: { diamonds: 10  } },
    { id: 'sl25',    icon: '⭐', group: 'Progresión', desc: 'Alcanzar nivel 25',              type: 'level',       target: 25,    reward: { diamonds: 25  } },
    { id: 'sl50',    icon: '⭐', group: 'Progresión', desc: 'Alcanzar nivel 50',              type: 'level',       target: 50,    reward: { diamonds: 50  } },
    { id: 'smg5',    icon: '🚛', group: 'Minijuego',  desc: 'Jugar 5 partidas del camión',   type: 'totalMini',   target: 5,     reward: { diamonds: 5   } },
    { id: 'smg20',   icon: '🚛', group: 'Minijuego',  desc: 'Jugar 20 partidas del camión',  type: 'totalMini',   target: 20,    reward: { diamonds: 15  } },
    { id: 'suc1',    icon: '⚙️', group: 'Mejoras',    desc: 'Mejorar 5 piezas del auto',     type: 'totalUpgCar', target: 5,     reward: { diamonds: 4   } },
    { id: 'suc2',    icon: '⚙️', group: 'Mejoras',    desc: 'Mejorar 20 piezas del auto',    type: 'totalUpgCar', target: 20,    reward: { diamonds: 12  } },
    { id: 'sug1',    icon: '🏗',  group: 'Mejoras',    desc: 'Mejorar el garage 3 veces',     type: 'totalUpgGar', target: 3,     reward: { diamonds: 5   } },
    { id: 'ssh1',    icon: '👷', group: 'Mejoras',    desc: 'Contratar 3 mecánicos',         type: 'totalStaff',  target: 3,     reward: { diamonds: 6   } },
    { id: 'ssh2',    icon: '👷', group: 'Mejoras',    desc: 'Contratar 10 mecánicos',        type: 'totalStaff',  target: 10,    reward: { diamonds: 18  } },
];

// ── Google Play Achievement hooks ─────────────────────────────────
const GP_ACHIEVEMENTS = {
    'sw1':   'CgkI_________________________AQ',
    'sw25':  'CgkI_________________________Ag',
    'sw100': 'CgkI_________________________Aw',
    'sp1':   'CgkI_________________________BA',
    'sp10':  'CgkI_________________________BQ',
    'sl10':  'CgkI_________________________Bg',
    'sl50':  'CgkI_________________________Bw',
    'smg5':  'CgkI_________________________CA',
};

function _unlockGPAchievement(taskId) {
    const achId = GP_ACHIEVEMENTS[taskId];
    if (!achId) return;
    if (window.GooglePlay && window.GooglePlay.unlockAchievement) {
        window.GooglePlay.unlockAchievement(achId);
    }
}

// ── TaskManager ───────────────────────────────────────────────────
let _tasksTab = 'daily';

const TaskManager = {

    init() {
        if (!game.tasks) game.tasks = { dailyReset: 0, dailyIds: [], dailyProgress: {}, dailyClaimed: {}, superClaimed: {} };
        // Ensure all stat keys exist even on saves created before they were added
        if (!game.stats) game.stats = {};
        const statDefaults = { totalRepairs: 0, totalRacesRun: 0, totalWins: 0, totalPoles: 0, totalMinigames: 0, totalRaceCoins: 0, totalUpgCar: 0, totalUpgGar: 0, totalStaff: 0 };
        Object.keys(statDefaults).forEach(k => { if (game.stats[k] === undefined) game.stats[k] = statDefaults[k]; });
        this.checkDailyReset();
        this._updateBadge();
    },

    checkDailyReset() {
        const now   = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        if ((game.tasks.dailyReset || 0) < today) {
            game.tasks.dailyReset    = today;
            game.tasks.dailyProgress = {};
            game.tasks.dailyClaimed  = {};
            const pool = [...DAILY_TASK_POOL].sort(() => Math.random() - 0.5);
            game.tasks.dailyIds = pool.slice(0, 3).map(t => t.id);
            if (window.save_user_progress) save_user_progress();
        }
    },

    getDailyTasks() {
        return (game.tasks.dailyIds || [])
            .map(id => DAILY_TASK_POOL.find(t => t.id === id))
            .filter(Boolean);
    },

    getDailyProgress(task) {
        return game.tasks.dailyProgress[task.id] || 0;
    },

    getSuperProgress(task) {
        const s = game.stats || {};
        switch (task.type) {
            case 'totalRepair':  return s.totalRepairs   || 0;
            case 'totalWin':     return s.totalWins      || 0;
            case 'totalPole':    return s.totalPoles     || 0;
            case 'level':        return game.level       || 1;
            case 'totalMini':    return s.totalMinigames || 0;
            case 'totalUpgCar':  return s.totalUpgCar    || 0;
            case 'totalUpgGar':  return s.totalUpgGar    || 0;
            case 'totalStaff':   return s.totalStaff     || 0;
        }
        return 0;
    },

    trackDaily(type, amount) {
        amount = amount || 1;
        this.checkDailyReset();
        let changed = false;
        this.getDailyTasks().forEach(task => {
            if (task.type === type && !game.tasks.dailyClaimed[task.id]) {
                game.tasks.dailyProgress[task.id] = (game.tasks.dailyProgress[task.id] || 0) + amount;
                changed = true;
            }
        });
        this._updateBadge();
        if (changed) {
            const ov = document.getElementById('tasksOverlay');
            if (ov && ov.classList.contains('tasks-overlay-active')) _renderTasksContent();
        }
    },

    claimDaily(taskId) {
        const task = DAILY_TASK_POOL.find(t => t.id === taskId);
        if (!task || game.tasks.dailyClaimed[taskId]) return;
        const prog = game.tasks.dailyProgress[taskId] || 0;
        if (prog < task.target) { notifyWarn('Tarea no completada aún'); return; }
        game.tasks.dailyClaimed[taskId] = true;
        if (task.reward.coins) earn_coins(task.reward.coins);
        if (task.reward.xp)    addXP(task.reward.xp);
        notifySuccess(`✅ +$${task.reward.coins || 0}  +${task.reward.xp || 0}XP`);
        if (window.save_user_progress) save_user_progress();
        this._updateBadge();
        _renderTasksContent();
    },

    claimSuper(taskId) {
        const task = SUPER_TASKS.find(t => t.id === taskId);
        if (!task || game.tasks.superClaimed[taskId]) return;
        const prog = this.getSuperProgress(task);
        if (prog < task.target) { notifyWarn('Objetivo no alcanzado aún'); return; }
        game.tasks.superClaimed[taskId] = true;
        game.diamonds = (game.diamonds || 0) + task.reward.diamonds;
        notifySuccess(`💎 +${task.reward.diamonds} diamantes`);
        _unlockGPAchievement(taskId);
        if (window.save_user_progress) save_user_progress();
        this._updateBadge();
        _renderTasksContent();
    },

    countClaimable() {
        let n = 0;
        this.getDailyTasks().forEach(task => {
            if (!game.tasks.dailyClaimed[task.id] &&
                (game.tasks.dailyProgress[task.id] || 0) >= task.target) n++;
        });
        SUPER_TASKS.forEach(task => {
            if (!game.tasks.superClaimed[task.id] &&
                this.getSuperProgress(task) >= task.target) n++;
        });
        return n;
    },

    _updateBadge() {
        const badge = document.getElementById('tasksFabBadge');
        const count = this.countClaimable();
        if (!badge) return;
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
};

// ── Tasks overlay render ──────────────────────────────────────────
function openTasksOverlay() {
    TaskManager.checkDailyReset();
    const overlay = document.getElementById('tasksOverlay');
    if (overlay) overlay.classList.add('tasks-overlay-active');
    _renderTasksContent();
}

function closeTasksOverlay() {
    const overlay = document.getElementById('tasksOverlay');
    if (overlay) overlay.classList.remove('tasks-overlay-active');
}

function _setTasksTab(tab) {
    _tasksTab = tab;
    _renderTasksContent();
}

function _renderTasksContent() {
    const body = document.getElementById('tasksOverlayBody');
    if (!body) return;

    if (_tasksTab === 'daily') {
        _renderDailyTasks(body);
    } else {
        _renderSuperTasks(body);
    }

    document.querySelectorAll('.tov-tab').forEach(btn => {
        btn.classList.toggle('tov-tab-active', btn.dataset.tab === _tasksTab);
    });
}

function _renderDailyTasks(el) {
    const tasks = TaskManager.getDailyTasks();

    const now      = Date.now();
    const tomorrow = (game.tasks.dailyReset || 0) + 86400000;
    const diff     = Math.max(0, tomorrow - now);
    const hrs      = Math.floor(diff / 3600000);
    const mins     = Math.floor((diff % 3600000) / 60000);

    const taskCards = tasks.map(task => {
        const prog     = TaskManager.getDailyProgress(task);
        const claimed  = game.tasks.dailyClaimed[task.id];
        const complete = prog >= task.target;
        const pct      = Math.min(100, Math.round((prog / task.target) * 100));

        const btnHtml = claimed
            ? `<span class="tk-claimed">✓ Reclamado</span>`
            : complete
                ? `<button class="rbtn accent-btn tk-claim-btn" onclick="TaskManager.claimDaily('${task.id}')">Reclamar</button>`
                : `<span class="tk-pending">${prog}/${task.target}</span>`;

        return `
        <div class="tk-card ${claimed ? 'tk-done' : complete ? 'tk-ready' : ''}">
            <div class="tk-top">
                <span class="tk-icon">${task.icon}</span>
                <div class="tk-info">
                    <div class="tk-desc">${task.desc}</div>
                    <div class="tk-reward">+$${task.reward.coins} · +${task.reward.xp}XP</div>
                </div>
                ${btnHtml}
            </div>
            <div class="tk-bar-wrap">
                <div class="tk-bar" style="width:${claimed ? 100 : pct}%;background:${claimed ? 'var(--green)' : 'var(--accent)'}"></div>
            </div>
        </div>`;
    }).join('');

    el.innerHTML = `
    <div class="tov-reset-row">⏱ Reinicio en ${hrs}h ${mins}m</div>
    <div class="tov-tasks-list">${taskCards || '<div class="empty-row">Cargando tareas...</div>'}</div>`;
}

function _renderSuperTasks(el) {
    const groups = [...new Set(SUPER_TASKS.map(t => t.group))];

    const sections = groups.map(group => {
        const tasks = SUPER_TASKS.filter(t => t.group === group);
        const cards = tasks.map(task => {
            const prog    = TaskManager.getSuperProgress(task);
            const claimed = game.tasks.superClaimed[task.id];
            const ready   = !claimed && prog >= task.target;
            const pct     = Math.min(100, Math.round((prog / task.target) * 100));

            const btnHtml = claimed
                ? `<span class="tk-claimed">✓</span>`
                : ready
                    ? `<button class="rbtn accent-btn tk-claim-btn" onclick="TaskManager.claimSuper('${task.id}')">💎 Reclamar</button>`
                    : `<span class="tk-pending">${prog >= 1000 ? (prog/1000).toFixed(1)+'k' : prog}/${task.target >= 1000 ? (task.target/1000)+'k' : task.target}</span>`;

            return `
            <div class="tk-card ${claimed ? 'tk-done' : ready ? 'tk-ready' : ''}">
                <div class="tk-top">
                    <span class="tk-icon">${task.icon}</span>
                    <div class="tk-info">
                        <div class="tk-desc">${task.desc}</div>
                        <div class="tk-reward" style="color:var(--diamond)">+${task.reward.diamonds}💎</div>
                    </div>
                    ${btnHtml}
                </div>
                ${!claimed ? `<div class="tk-bar-wrap"><div class="tk-bar" style="width:${pct}%;background:${ready ? 'var(--diamond)' : 'var(--accent)'}"></div></div>` : ''}
            </div>`;
        }).join('');

        return `<div class="tov-group-label">${group}</div>${cards}`;
    }).join('');

    el.innerHTML = `<div class="tov-tasks-list">${sections}</div>`;
}

window.TaskManager = TaskManager;
