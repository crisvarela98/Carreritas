const express = require('express');
const { Pool }  = require('pg');
const cors      = require('cors');
const path      = require('path');

const app  = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname)));

// ── POST /api/save ────────────────────────────────────────────────
// Body: { deviceId, saveData }
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
    const totalWins   = Math.max(0, parseInt((saveData.medals || {}).gold)   || 0);
    const totalRepairs= Math.max(0, parseInt((saveData.stats  || {}).totalRepairs) || 0);
    const totalCoins  = Math.max(0, parseInt(saveData.money)  || 0);

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
                `INSERT INTO leaderboard (device_id, player_name, garage_name, level, total_wins, total_repairs, total_coins, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                 ON CONFLICT (device_id) DO UPDATE
                 SET player_name = $2, garage_name = $3, level = $4,
                     total_wins = $5, total_repairs = $6, total_coins = $7, updated_at = NOW()`,
                [deviceId, playerName, garageName, level, totalWins, totalRepairs, totalCoins]
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
            `SELECT player_name, garage_name, level, total_wins, total_repairs, total_coins,
                    updated_at,
                    RANK() OVER (ORDER BY level DESC, total_wins DESC, total_repairs DESC) AS rank
             FROM leaderboard
             ORDER BY level DESC, total_wins DESC, total_repairs DESC
             LIMIT 50`
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
