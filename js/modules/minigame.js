// ── Mini-game: Camión Ciudad ──────────────────────────────────────
const MiniGame = {
    lane:      1,       // 0=left 1=center 2=right
    score:     0,
    running:   false,
    _scoreInt: null,
    _spawnTO:  null,
    _collInt:  null,
    _obstacles:[],
    _startTs:  0,

    open() {
        const ov = document.getElementById('minigameOverlay');
        if (ov) ov.classList.add('mg-active');
        this._renderStart();
    },

    _renderStart() {
        const area = document.getElementById('mgGameArea');
        if (!area) return;
        area.innerHTML = `
        <div class="mg-start-screen">
            <div class="mg-big-icon">🚛</div>
            <div class="mg-start-title">CAMIÓN CIUDAD</div>
            <div class="mg-start-desc">Esquiva el tráfico · Gana <span style="color:var(--green)">$50</span> por segundo</div>
            <button class="rbtn accent-btn mg-start-btn" onclick="MiniGame.start()">▶ ARRANCAR</button>
            <div class="mg-tap-hint">◀ Toca izquierda/derecha para cambiar carril ▶</div>
        </div>`;
    },

    start() {
        const area = document.getElementById('mgGameArea');
        if (!area) return;
        this.lane      = 1;
        this.score     = 0;
        this.running   = true;
        this._obstacles = [];
        this._startTs  = Date.now();

        area.innerHTML = `
        <div id="mgRoad" class="mg-road">
            <div class="mg-road-bg"></div>
            <div class="mg-lane-mark mg-lm1"></div>
            <div class="mg-lane-mark mg-lm2"></div>
            <div id="mgPlayer" class="mg-player">🚛</div>
            <div class="mg-tap-z mg-tap-left"
                 ontouchstart="MiniGame.moveLeft();event.preventDefault()"
                 onclick="MiniGame.moveLeft()"></div>
            <div class="mg-tap-z mg-tap-right"
                 ontouchstart="MiniGame.moveRight();event.preventDefault()"
                 onclick="MiniGame.moveRight()"></div>
        </div>
        <div class="mg-hud">
            <span id="mgScoreDisp" class="mg-hud-score">$0</span>
            <div class="mg-timer-wrap"><div id="mgTimerBar" class="mg-timer-bar"></div></div>
            <span class="mg-hud-hint">↔ cambiar carril</span>
        </div>`;

        this._positionPlayer(false);

        // Track stat
        if (!game.stats) game.stats = {};
        game.stats.totalMinigames = (game.stats.totalMinigames || 0) + 1;
        if (window.TaskManager) {
            TaskManager.trackDaily('minigame');
            TaskManager._updateBadge();
        }

        // Score tick
        this._scoreInt = setInterval(() => {
            if (!this.running) return;
            this.score += 50;
            const el = document.getElementById('mgScoreDisp');
            if (el) el.textContent = '$' + this.score.toLocaleString();
            // Timer bar
            const elapsed = Date.now() - this._startTs;
            const pct     = Math.max(0, 100 - (elapsed / 60000) * 100);
            const bar     = document.getElementById('mgTimerBar');
            if (bar) { bar.style.width = pct + '%'; bar.style.background = pct > 40 ? 'var(--green)' : pct > 15 ? 'var(--orange)' : 'var(--red)'; }
        }, 1000);

        // Spawn with increasing difficulty
        let delay = 1800;
        const spawn = () => {
            if (!this.running) return;
            this._spawnCar();
            delay = Math.max(700, delay - 40);
            this._spawnTO = setTimeout(spawn, delay);
        };
        this._spawnTO = setTimeout(spawn, 1200);

        // Collision poll
        this._collInt = setInterval(() => this._checkCollisions(), 60);

        // Auto-win after 60s
        setTimeout(() => { if (this.running) this._endGame(true); }, 60000);
    },

    moveLeft()  { if (!this.running || this.lane <= 0) return; this.lane--; this._positionPlayer(true); },
    moveRight() { if (!this.running || this.lane >= 2) return; this.lane++; this._positionPlayer(true); },

    _positionPlayer(animate) {
        const p = document.getElementById('mgPlayer');
        if (!p) return;
        const lefts = ['8%', '37%', '66%'];
        p.style.left = lefts[this.lane];
        if (animate) {
            p.style.transition = 'left 0.12s ease';
            p.classList.add('mg-player-move');
            setTimeout(() => { if (p) p.classList.remove('mg-player-move'); }, 200);
        }
    },

    _spawnCar() {
        const road = document.getElementById('mgRoad');
        if (!road) return;
        const ICONS   = ['🚗','🚕','🚙','🏎','🚌','🚓','🚑'];
        const icon    = ICONS[Math.floor(Math.random() * ICONS.length)];
        const lane    = Math.floor(Math.random() * 3);
        const lefts   = ['8%', '37%', '66%'];
        const div     = document.createElement('div');
        div.className = 'mg-obstacle';
        div.textContent = icon;
        div.style.left  = lefts[lane];
        div.style.top   = '-70px';
        div.dataset.lane = lane;
        road.appendChild(div);

        const obsRef = { el: div, lane, done: false };
        this._obstacles.push(obsRef);

        const elapsed = Date.now() - this._startTs;
        const speed   = Math.min(11, 5 + elapsed / 12000);  // 5→11 over time
        let top = -70;
        const anim = setInterval(() => {
            if (!this.running || obsRef.done) { clearInterval(anim); if (div.parentNode) div.remove(); return; }
            top += speed;
            div.style.top = top + 'px';
            if (top > 570) {
                clearInterval(anim);
                if (div.parentNode) div.remove();
                this._obstacles = this._obstacles.filter(o => o !== obsRef);
            }
        }, 30);
    },

    _checkCollisions() {
        const player = document.getElementById('mgPlayer');
        if (!player) return;
        const pr = player.getBoundingClientRect();
        for (const obs of this._obstacles) {
            if (obs.done || parseInt(obs.el.dataset.lane) !== this.lane) continue;
            const or = obs.el.getBoundingClientRect();
            if (or.bottom > pr.top + 16 && or.top < pr.bottom - 16) {
                obs.done = true;
                this._endGame(false);
                return;
            }
        }
    },

    _endGame(completed) {
        if (!this.running) return;
        this.running = false;
        clearInterval(this._scoreInt);
        clearTimeout(this._spawnTO);
        clearInterval(this._collInt);
        this._obstacles.forEach(o => { o.done = true; });

        if (this.score > 0) {
            earn_coins(this.score);
            if (window.save_user_progress) save_user_progress();
        }
        if (window.TaskManager) TaskManager._updateBadge();

        const road = document.getElementById('mgRoad');
        if (!road) return;
        road.style.animation = 'none';
        road.innerHTML = `
        <div class="mg-end-screen">
            <div class="mg-end-icon">${completed ? '🏆' : '💥'}</div>
            <div class="mg-end-title">${completed ? '¡Misión cumplida!' : '¡Choque!'}</div>
            <div class="mg-end-sub">${completed ? '60 segundos sobrevividos' : 'Más suerte la próxima'}</div>
            <div class="mg-end-reward">+$${this.score.toLocaleString()}</div>
            <button class="rbtn accent-btn" style="margin-top:16px" onclick="MiniGame.start()">🔄 Jugar de nuevo</button>
            <button class="rbtn" style="margin-top:8px;opacity:0.7" onclick="MiniGame.close()">← Salir</button>
        </div>`;
    },

    close() {
        this.running = false;
        clearInterval(this._scoreInt);
        clearTimeout(this._spawnTO);
        clearInterval(this._collInt);
        this._obstacles.forEach(o => { o.done = true; });
        const ov = document.getElementById('minigameOverlay');
        if (ov) ov.classList.remove('mg-active');
    }
};

window.MiniGame = MiniGame;
