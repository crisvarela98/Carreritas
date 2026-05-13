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
        // FTUE hook
        if (window.FTUEManager) FTUEManager.onMinigameStarted();
    },

    _renderStart() {
        const area = document.getElementById('mgGameArea');
        if (!area) return;
        area.innerHTML = `
        <div class="mg-start-screen">
            <div class="mg-big-icon">🚛</div>
            <div class="mg-start-title">CAMIÓN CIUDAD</div>
            <div class="mg-start-desc">Esquivá el tráfico · Ganás <span style="color:var(--green)">$150</span> por segundo</div>
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">30 segundos de supervivencia = $4,500</div>
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

        // Score $150/s
        this._scoreInt = setInterval(() => {
            if (!this.running) return;
            this.score += 150;
            const disp = document.getElementById('mgScoreDisp');
            if (disp) disp.textContent = '$' + this.score.toLocaleString();
        }, 1000);

        // Timer bar (60s max)
        const MAX_MS  = 60000;
        const barTick = setInterval(() => {
            if (!this.running) { clearInterval(barTick); return; }
            const bar  = document.getElementById('mgTimerBar');
            const pct  = Math.min(100, (Date.now() - this._startTs) / MAX_MS * 100);
            if (bar) {
                bar.style.width = pct + '%';
                bar.style.background = pct < 50 ? 'var(--accent)' : pct < 80 ? 'var(--orange)' : 'var(--red)';
            }
            if (pct >= 100) { clearInterval(barTick); this._endGame(true); }
        }, 500);

        // Spawn obstacles
        this._spawnObstacle();

        // Collision detection
        this._collInt = setInterval(() => this._checkCollision(), 200);

        // Keyboard support
        this._keyHandler = (e) => {
            if (e.key === 'ArrowLeft')  this.moveLeft();
            if (e.key === 'ArrowRight') this.moveRight();
        };
        document.addEventListener('keydown', this._keyHandler);
    },

    _positionPlayer(animate) {
        const p = document.getElementById('mgPlayer');
        if (!p) return;
        const pcts = ['16%', '50%', '83%'];
        p.style.left = pcts[this.lane];
        p.style.transform = 'translateX(-50%)';
        if (animate) {
            p.classList.add('mg-player-move');
            setTimeout(() => p.classList.remove('mg-player-move'), 200);
        }
    },

    moveLeft()  { if (this.lane > 0) { this.lane--; this._positionPlayer(true); } },
    moveRight() { if (this.lane < 2) { this.lane++; this._positionPlayer(true); } },

    _spawnObstacle() {
        if (!this.running) return;
        const road = document.getElementById('mgRoad');
        if (!road) return;

        const lane = Math.floor(Math.random() * 3);
        const icons = ['🚗','🚕','🚙','🏎','🚌','🚎'];
        const el = document.createElement('div');
        el.className = 'mg-obstacle';
        el.textContent = icons[Math.floor(Math.random() * icons.length)];
        const pcts = ['16%','50%','83%'];
        el.style.left = pcts[lane];
        el.style.top  = '-60px';
        el.style.transform = 'translateX(-50%)';
        el.dataset.lane = lane;
        road.appendChild(el);
        this._obstacles.push(el);

        // Animate downward
        let y = -60;
        const speed = 4 + Math.random() * 3;
        const anim = setInterval(() => {
            if (!this.running) { clearInterval(anim); el.remove(); return; }
            y += speed;
            el.style.top = y + 'px';
            const roadH = road.offsetHeight || 500;
            if (y > roadH + 60) {
                clearInterval(anim);
                el.remove();
                this._obstacles = this._obstacles.filter(o => o !== el);
            }
        }, 30);

        // Spawn next
        const delay = Math.max(600, 1400 - Math.min(800, (Date.now() - this._startTs) / 60));
        this._spawnTO = setTimeout(() => this._spawnObstacle(), delay);
    },

    _checkCollision() {
        const player = document.getElementById('mgPlayer');
        if (!player) return;
        const pr = player.getBoundingClientRect();

        for (const obs of this._obstacles) {
            const or = obs.getBoundingClientRect();
            const overlap = !(pr.right < or.left || pr.left > or.right || pr.bottom < or.top || pr.top > or.bottom);
            if (overlap) {
                this._endGame(false);
                return;
            }
        }
    },

    _endGame(survived) {
        if (!this.running) return;
        this.running = false;
        clearInterval(this._scoreInt);
        clearTimeout(this._spawnTO);
        clearInterval(this._collInt);
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);

        earn_coins(this.score);
        addXP(Math.floor(this.score / 30));
        if (!game.stats) game.stats = {};
        game.stats.totalMinigames = (game.stats.totalMinigames || 0) + 1;

        const area = document.getElementById('mgGameArea');
        if (!area) return;

        const resultIcon = survived ? '🏆' : '💥';
        const resultMsg  = survived ? '¡Sobreviviste los 60 segundos!' : '¡Choque! Fin del juego';

        area.innerHTML = `
        <div class="mg-start-screen">
            <div class="mg-big-icon">${resultIcon}</div>
            <div class="mg-start-title">${resultMsg}</div>
            <div class="mg-start-desc" style="color:var(--coin);font-size:22px">+$${this.score.toLocaleString()}</div>
            <button class="rbtn accent-btn mg-start-btn" onclick="MiniGame.start()">▶ JUGAR DE NUEVO</button>
            <button class="rbtn" onclick="MiniGame.close()">← Salir</button>
        </div>`;

        save_user_progress();
    },

    close() {
        this.running = false;
        clearInterval(this._scoreInt);
        clearTimeout(this._spawnTO);
        clearInterval(this._collInt);
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        const ov = document.getElementById('minigameOverlay');
        if (ov) ov.classList.remove('mg-active');
    }
};

window.MiniGame = MiniGame;
