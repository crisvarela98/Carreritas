// ── Cloud Save — syncs game state to backend DB ───────────────────
// Identity = UUID stored in localStorage (no login required).
// Falls back gracefully if the server is unreachable.

const CloudSave = (() => {

    const DEVICE_KEY = 'mgt_device_id';
    let _deviceId = null;
    let _syncing   = false;
    let _lastSyncedAt = 0;
    let _offlineSilenced = false;

    // Replit server URL — used when the game runs outside of Replit (e.g. GitHub Pages).
    // Works while this Repl is running. For 24/7 access, deploy the app and update this URL.
    const REPLIT_SERVER = 'https://dd7f52b6-ea99-43b2-8887-9c037baba08d-00-2qx1ff8q2g7g2.picard.replit.dev';

    // Returns the API base URL.
    // On Replit itself → empty string (relative URLs work fine).
    // Everywhere else  → absolute Replit server URL.
    function _base() {
        const host = window.location.hostname;
        if (
            host === 'localhost' ||
            host === '127.0.0.1' ||
            host.endsWith('.replit.dev') ||
            host.endsWith('.replit.app') ||
            host.endsWith('.picard.replit.dev') ||
            host.endsWith('.id.repl.co')
        ) {
            return '';
        }
        return REPLIT_SERVER;
    }

    function _getDeviceId() {
        if (_deviceId) return _deviceId;
        let id = localStorage.getItem(DEVICE_KEY);
        if (!id) {
            id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            localStorage.setItem(DEVICE_KEY, id);
        }
        _deviceId = id;
        return id;
    }

    async function save(gameState) {
        if (_syncing) return;
        _syncing = true;
        try {
            const res = await fetch(_base() + '/api/save', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ deviceId: _getDeviceId(), saveData: gameState }),
                signal:  AbortSignal.timeout(6000)
            });
            const json = await res.json();
            if (json.ok) {
                _lastSyncedAt = Date.now();
                _offlineSilenced = false;
                _updateSyncBadge(true);
            }
        } catch (_) {
            if (!_offlineSilenced) {
                _updateSyncBadge(false);
                _offlineSilenced = true;
            }
        } finally {
            _syncing = false;
        }
    }

    async function load() {
        try {
            const res  = await fetch(_base() + `/api/load/${_getDeviceId()}`,
                { signal: AbortSignal.timeout(6000) });
            const json = await res.json();
            if (json.ok && json.found) return json.saveData;
        } catch (_) { /* offline — caller uses localStorage */ }
        return null;
    }

    async function fetchLeaderboard() {
        try {
            const res  = await fetch(_base() + '/api/leaderboard',
                { signal: AbortSignal.timeout(8000) });
            const json = await res.json();
            return json.ok ? json.rows : [];
        } catch (_) { return []; }
    }

    function _updateSyncBadge(ok) {
        const el = document.getElementById('cloudSyncBadge');
        if (!el) return;
        if (ok) {
            el.textContent = '☁️ Guardado';
            el.className   = 'cloud-badge cloud-ok';
            clearTimeout(el._t);
            el._t = setTimeout(() => { el.textContent = ''; }, 3000);
        } else {
            el.textContent = '⚠️ Sin conexión';
            el.className   = 'cloud-badge cloud-err';
            clearTimeout(el._t);
            el._t = setTimeout(() => { el.textContent = ''; el.className = 'cloud-badge'; }, 5000);
        }
    }

    return { save, load, fetchLeaderboard, getDeviceId: _getDeviceId, base: _base };
})();

window.CloudSave = CloudSave;
