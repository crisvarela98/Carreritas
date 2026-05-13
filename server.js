const express = require('express');
const { Pool }  = require('pg');
const cors      = require('cors');
const path      = require('path');

const app  = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname)));

// ── Create tables on startup ───────────────────────────────────────
async function initDb() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS saves (
                device_id   VARCHAR(64) PRIMARY KEY,
                player_name VARCHAR(64),
                garage_name VARCHAR(64),
                save_data   JSONB NOT NULL,
                updated_at  TIMESTAMP DEFAULT NOW()
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                device_id      VARCHAR(64) PRIMARY KEY,
                player_name    VARCHAR(64),
                garage_name    VARCHAR(64),
                level          INTEGER DEFAULT 1,
                xp             INTEGER DEFAULT 0,
                total_wins     INTEGER DEFAULT 0,
                total_repairs  INTEGER DEFAULT 0,
                total_coins    INTEGER DEFAULT 0,
                total_poles    INTEGER DEFAULT 0,
                wins_car       INTEGER DEFAULT 0,
                wins_moto      INTEGER DEFAULT 0,
                wins_rally     INTEGER DEFAULT 0,
                wins_formula   INTEGER DEFAULT 0,
                updated_at     TIMESTAMP DEFAULT NOW()
            )
        `);
        // Add new columns to existing tables if they don't exist (migration)
        const newCols = [
            `ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS xp           INTEGER DEFAULT 0`,
            `ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS total_poles  INTEGER DEFAULT 0`,
            `ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS wins_car     INTEGER DEFAULT 0`,
            `ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS wins_moto    INTEGER DEFAULT 0`,
            `ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS wins_rally   INTEGER DEFAULT 0`,
            `ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS wins_formula INTEGER DEFAULT 0`,
        ];
        for (const sql of newCols) {
            await pool.query(sql).catch(() => {});
        }
        console.log('✅ Database tables ready');
    } catch (err) {
        console.error('[initDb]', err.message);
    }
}
initDb();

// ── POST /api/save ────────────────────────────────────────────────
app.post('/api/save', async (req, res) => {
    const { deviceId, saveData } = req.body;
    if (!deviceId || typeof deviceId !== 'string' || deviceId.length > 64) {
        return res.status(400).json({ ok: false, error: 'Invalid deviceId' });
    }
    if (!saveData || typeof saveData !== 'object') {
        return res.status(400).json({ ok: false, error: 'Invalid saveData' });
    }

    const playerName  = String(saveData.playerName  || '').slice(0, 64);
    const garageName  = String(saveData.garageName  || '').slice(0, 64);
    const level       = Math.max(1, parseInt(saveData.level)  || 1);
    const xp          = Math.max(0, parseInt(saveData.xp) || 0);
    const totalWins   = Math.max(0, parseInt((saveData.stats || {}).totalWins)      || 0);
    const totalRepairs= Math.max(0, parseInt((saveData.stats || {}).totalRepairs)   || 0);
    const totalCoins  = Math.max(0, parseInt(saveData.money)  || 0);
    const totalPoles  = Math.max(0, parseInt((saveData.stats || {}).totalPoles)     || 0);
    const winsCarVal  = Math.max(0, parseInt((saveData.stats || {}).wins_car)       || 0);
    const winsMotoVal = Math.max(0, parseInt((saveData.stats || {}).wins_moto)      || 0);
    const winsRallyVal= Math.max(0, parseInt((saveData.stats || {}).wins_rally)     || 0);
    const winsFormulaVal = Math.max(0, parseInt((saveData.stats || {}).wins_formula)|| 0);

    try {
        await pool.query(
            `INSERT INTO saves (device_id, player_name, garage_name, save_data, updated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (device_id) DO UPDATE
             SET player_name = $2, garage_name = $3, save_data = $4, updated_at = NOW()`,
            [deviceId, playerName, garageName, JSON.stringify(saveData)]
        );

        if (playerName) {
            await pool.query(
                `INSERT INTO leaderboard
                    (device_id, player_name, garage_name, level, xp, total_wins, total_repairs,
                     total_coins, total_poles, wins_car, wins_moto, wins_rally, wins_formula, updated_at)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
                 ON CONFLICT (device_id) DO UPDATE
                 SET player_name=$2, garage_name=$3, level=$4, xp=$5,
                     total_wins=$6, total_repairs=$7, total_coins=$8,
                     total_poles=$9, wins_car=$10, wins_moto=$11,
                     wins_rally=$12, wins_formula=$13, updated_at=NOW()`,
                [deviceId, playerName, garageName, level, xp, totalWins, totalRepairs,
                 totalCoins, totalPoles, winsCarVal, winsMotoVal, winsRallyVal, winsFormulaVal]
            );
        }

        res.json({ ok: true });
    } catch (err) {
        console.error('[save]', err.message);
        res.status(500).json({ ok: false, error: 'DB error' });
    }
});

// ── GET /api/load/:deviceId ───────────────────────────────────────
app.get('/api/load/:deviceId', async (req, res) => {
    const { deviceId } = req.params;
    if (!deviceId || deviceId.length > 64) {
        return res.status(400).json({ ok: false, error: 'Invalid deviceId' });
    }
    try {
        const { rows } = await pool.query(
            'SELECT save_data, updated_at FROM saves WHERE device_id = $1',
            [deviceId]
        );
        if (rows.length === 0) return res.json({ ok: true, found: false });
        res.json({ ok: true, found: true, saveData: rows[0].save_data, updatedAt: rows[0].updated_at });
    } catch (err) {
        console.error('[load]', err.message);
        res.status(500).json({ ok: false, error: 'DB error' });
    }
});

// ── GET /api/leaderboard ─────────────────────────────────────────
app.get('/api/leaderboard', async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT device_id, player_name, garage_name, level, xp,
                    total_wins, total_repairs, total_coins, total_poles,
                    wins_car, wins_moto, wins_rally, wins_formula,
                    updated_at,
                    RANK() OVER (ORDER BY level DESC, total_wins DESC, total_repairs DESC) AS rank
             FROM leaderboard
             ORDER BY level DESC, total_wins DESC, total_repairs DESC
             LIMIT 100`
        );
        res.json({ ok: true, rows });
    } catch (err) {
        console.error('[leaderboard]', err.message);
        res.status(500).json({ ok: false, rows: [] });
    }
});

// ── Fallback → serve index.html for any unknown route ────────────
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏎  Motorsport Garage Tycoon server running on :${PORT}`);
});
