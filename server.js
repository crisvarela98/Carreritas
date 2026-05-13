const express    = require('express');
const { MongoClient } = require('mongodb');
const cors       = require('cors');
const path       = require('path');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname)));

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
}

let db;
const client = new MongoClient(MONGO_URI);

async function initDb() {
    try {
        await client.connect();
        db = client.db('garage_motorsports');
        await db.collection('saves').createIndex({ device_id: 1 }, { unique: true });
        await db.collection('leaderboard').createIndex({ device_id: 1 }, { unique: true });
        console.log('✅ MongoDB connected — garage_motorsports');
    } catch (err) {
        console.error('[initDb]', err.message);
        process.exit(1);
    }
}

// ── POST /api/save ────────────────────────────────────────────────
app.post('/api/save', async (req, res) => {
    const { deviceId, saveData } = req.body;
    if (!deviceId || typeof deviceId !== 'string' || deviceId.length > 64)
        return res.status(400).json({ ok: false, error: 'Invalid deviceId' });
    if (!saveData || typeof saveData !== 'object')
        return res.status(400).json({ ok: false, error: 'Invalid saveData' });

    const playerName     = String(saveData.playerName  || '').slice(0, 64);
    const garageName     = String(saveData.garageName  || '').slice(0, 64);
    const level          = Math.max(1, parseInt(saveData.level)  || 1);
    const xp             = Math.max(0, parseInt(saveData.xp)     || 0);
    const stats          = saveData.stats || {};
    const totalWins      = Math.max(0, parseInt(stats.totalWins)    || 0);
    const totalRepairs   = Math.max(0, parseInt(stats.totalRepairs) || 0);
    const totalCoins     = Math.max(0, parseInt(saveData.money)     || 0);
    const totalPoles     = Math.max(0, parseInt(stats.totalPoles)   || 0);
    const winsCarVal     = Math.max(0, parseInt(stats.wins_car)     || 0);
    const winsMotoVal    = Math.max(0, parseInt(stats.wins_moto)    || 0);
    const winsRallyVal   = Math.max(0, parseInt(stats.wins_rally)   || 0);
    const winsFormulaVal = Math.max(0, parseInt(stats.wins_formula) || 0);
    const sessionTime    = Math.max(0, parseInt(saveData.totalPlayTime) || 0);

    try {
        const now = new Date();
        await db.collection('saves').updateOne(
            { device_id: deviceId },
            { $set: { device_id: deviceId, player_name: playerName, garage_name: garageName,
                      save_data: saveData, updated_at: now } },
            { upsert: true }
        );

        if (playerName) {
            await db.collection('leaderboard').updateOne(
                { device_id: deviceId },
                { $set: { device_id: deviceId, player_name: playerName, garage_name: garageName,
                          level, xp, total_wins: totalWins, total_repairs: totalRepairs,
                          total_coins: totalCoins, total_poles: totalPoles,
                          wins_car: winsCarVal, wins_moto: winsMotoVal,
                          wins_rally: winsRallyVal, wins_formula: winsFormulaVal,
                          session_time: sessionTime,
                          updated_at: now } },
                { upsert: true }
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
    if (!deviceId || deviceId.length > 64)
        return res.status(400).json({ ok: false, error: 'Invalid deviceId' });
    try {
        const doc = await db.collection('saves').findOne({ device_id: deviceId });
        if (!doc) return res.json({ ok: true, found: false });
        res.json({ ok: true, found: true, saveData: doc.save_data, updatedAt: doc.updated_at });
    } catch (err) {
        console.error('[load]', err.message);
        res.status(500).json({ ok: false, error: 'DB error' });
    }
});

// ── GET /api/leaderboard ──────────────────────────────────────────
app.get('/api/leaderboard', async (req, res) => {
    try {
        const rows = await db.collection('leaderboard')
            .find({})
            .sort({ level: -1, total_wins: -1, total_repairs: -1 })
            .limit(100)
            .toArray();

        const ranked = rows.map((r, i) => ({
            device_id:     r.device_id,
            player_name:   r.player_name,
            garage_name:   r.garage_name,
            level:         r.level,
            xp:            r.xp,
            total_wins:    r.total_wins,
            total_repairs: r.total_repairs,
            total_coins:   r.total_coins,
            total_poles:   r.total_poles,
            wins_car:      r.wins_car,
            wins_moto:     r.wins_moto,
            wins_rally:    r.wins_rally,
            wins_formula:  r.wins_formula,
            session_time:  r.session_time || 0,
            updated_at:    r.updated_at,
            rank:          i + 1
        }));

        res.json({ ok: true, rows: ranked });
    } catch (err) {
        console.error('[leaderboard]', err.message);
        res.status(500).json({ ok: false, rows: [] });
    }
});

// ── Fallback → index.html ─────────────────────────────────────────
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
initDb().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🏎  Motorsport Garage Tycoon running on :${PORT}`);
    });
});
