// ── Mini-game: Camión Ciudad — Top-Down View ──────────────────────
// Lane x positions (top-down: left, center, right)
const MG_LANE_PCTS = ['16%', '50%', '83%'];
const MG_LANE_LABELS = ['IZQ', 'CEN', 'DER'];

// Obstacle car sprites
const MG_CAR_SPRITES = ['car_green', 'car_yellow', 'car_red'];

const MiniGame = {
    lane:       1,
    score:      0,
    running:    false,
    _scoreInt:  null,
    _spawnTO:   null,
    _collInt:   null,
    _obstacles: [],
    _startTs:   0,
    _keyHandler:null,

    open() {
        const ov = document.getElementById('minigameOverlay');
        if (ov) ov.classList.add('mg-active');
        this._renderStart();
        if (window.FTUEManager) FTUEManager.onMinigameStarted();
    },

    _renderStart() {
        const area = document.getElementById('mgGameArea');
        if (!area) return;
        area.innerHTML = `
        <div class="mg-start-screen">
            <div class="mg-big-icon"><img src="/assets/truck.png" style="width:72px;height:auto;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.5))"></div>
            <div class="mg-start-title">CAMIÓN CIUDAD</div>
            <div class="mg-start-desc">Esquivá el tráfico · Ganás <span style="color:var(--green)">$150</span> por segundo</div>
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">60 segundos de supervivencia = $9,000</div>
            <button class="rbtn accent-btn mg-start-btn" onclick="MiniGame.start()">▶ ARRANCAR</button>
            <div class="mg-tap-hint">◀ Toca izquierda/derecha para cambiar carril ▶</div>
        </div>`;
    },

    start() {
        const area = document.getElementById('mgGameArea');
        if (!area) return;
        this.lane       = 1;
        this.score      = 0;
        this.running    = true;
        this._obstacles = [];
        this._startTs   = Date.now();

        area.innerHTML = `
        <div id="mgRoad" class="mg-road mg-fp">
            <img id="mgPlayer" class="mg-player-sprite" src="/assets/truck.png">

            <!-- Lane indicator -->
            <div class="mg-lane-ind">
                <div id="mgLaneL" class="mg-li">IZQ</div>
                <div id="mgLaneC" class="mg-li active">CEN</div>
                <div id="mgLaneR" class="mg-li">DER</div>
            </div>

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

        this._positionPlayer();

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
            const bar = document.getElementById('mgTimerBar');
            const pct = Math.min(100, (Date.now() - this._startTs) / MAX_MS * 100);
            if (bar) {
                bar.style.width      = pct + '%';
                bar.style.background = pct < 50 ? 'var(--accent)' : pct < 80 ? 'var(--orange)' : 'var(--red)';
            }
            if (pct >= 100) { clearInterval(barTick); this._endGame(true); }
        }, 500);

        this._spawnObstacle();
        this._collInt = setInterval(() => this._checkCollision(), 200);

        this._keyHandler = (e) => {
            if (e.key === 'ArrowLeft')  this.moveLeft();
            if (e.key === 'ArrowRight') this.moveRight();
        };
        document.addEventListener('keydown', this._keyHandler);
    },

    // ── Player positioning ───────────────────────────────────────────
    _positionPlayer() {
        const p = document.getElementById('mgPlayer');
        if (p) {
            p.style.left      = MG_LANE_PCTS[this.lane];
            p.style.transform = 'translateX(-50%)';
        }
        ['mgLaneL', 'mgLaneC', 'mgLaneR'].forEach((id, i) => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('active', i === this.lane);
        });
    },

    moveLeft() {
        if (this.lane > 0) { this.lane--; this._positionPlayer(); this._flashLane(); }
    },
    moveRight() {
        if (this.lane < 2) { this.lane++; this._positionPlayer(); this._flashLane(); }
    },

    _flashLane() {
        const ids = ['mgLaneL', 'mgLaneC', 'mgLaneR'];
        const el  = document.getElementById(ids[this.lane]);
        if (!el) return;
        el.classList.add('flash');
        setTimeout(() => el.classList.remove('flash'), 220);
    },

    // ── Obstacle spawn — top-down, straight vertical movement ────────
    _spawnObstacle() {
        if (!this.running) return;
        const road = document.getElementById('mgRoad');
        if (!road) return;

        const lane   = Math.floor(Math.random() * 3);
        const sprite = MG_CAR_SPRITES[Math.floor(Math.random() * MG_CAR_SPRITES.length)];

        const el = document.createElement('img');
        el.src        = `/assets/${sprite}.png`;
        el.className  = 'mg-car';
        el.dataset.lane = lane;
        el.style.position = 'absolute';
        el.style.left     = MG_LANE_PCTS[lane];
        el.style.transform = 'translateX(-50%)';
        road.appendChild(el);
        this._obstacles.push(el);

        const roadH = road.offsetHeight || 500;
        let y       = -100;
        const speed = 4 + Math.random() * 3;

        el.style.top = y + 'px';

        const anim = setInterval(() => {
            if (!this.running) { clearInterval(anim); el.remove(); return; }
            y += speed;
            el.style.top = y + 'px';

            if (y > roadH) {
                clearInterval(anim);
                el.remove();
                this._obstacles = this._obstacles.filter(o => o !== el);
            }
        }, 30);

        const delay = Math.max(600, 1400 - Math.min(800, (Date.now() - this._startTs) / 60));
        this._spawnTO = setTimeout(() => this._spawnObstacle(), delay);
    },

    // ── Collision detection — unchanged ─────────────────────────────
    _checkCollision() {
        const player = document.getElementById('mgPlayer');
        if (!player) return;
        const pr = player.getBoundingClientRect();

        for (const obs of this._obstacles) {
            const or      = obs.getBoundingClientRect();
            const overlap = !(pr.right < or.left || pr.left > or.right ||
                               pr.bottom < or.top  || pr.top > or.bottom);
            if (overlap) { this._endGame(false); return; }
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
        if (window.TaskManager) { TaskManager.trackDaily('minigame'); TaskManager._updateBadge(); }

        const area      = document.getElementById('mgGameArea');
        if (!area) return;
        const resultIcon = survived
            ? `<img src="/assets/truck.png" style="width:64px;height:auto;filter:drop-shadow(0 4px 16px rgba(0,200,100,0.6))">`
            : `<img src="/assets/car_red.png" style="width:64px;height:auto;filter:drop-shadow(0 4px 16px rgba(255,60,60,0.7)) hue-rotate(0deg)">`;
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
