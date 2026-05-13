// ── Cloud Save — syncs game state to backend DB ───────────────────
// Identity = UUID stored in localStorage (no login required).
// Falls back gracefully if the server is unreachable.

const CloudSave = (() => {

    const DEVICE_KEY = 'mgt_device_id';
    let _deviceId = null;
    let _syncing   = false;
    let _lastSyncedAt = 0;
    let _offlineSilenced = false;   // avoid repeating offline warning

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
            const res = await fetch('/api/save', {
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
            // Only show offline badge once per session to avoid annoyance
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
            const res  = await fetch(`/api/load/${_getDeviceId()}`,
                { signal: AbortSignal.timeout(6000) });
            const json = await res.json();
            if (json.ok && json.found) return json.saveData;
        } catch (_) { /* offline — caller uses localStorage */ }
        return null;
    }

    async function fetchLeaderboard() {
        try {
            const res  = await fetch('/api/leaderboard',
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
            // Offline — show briefly, don't keep nagging
            el.textContent = '⚠️ Sin conexión';
            el.className   = 'cloud-badge cloud-err';
            clearTimeout(el._t);
            el._t = setTimeout(() => { el.textContent = ''; el.className = 'cloud-badge'; }, 5000);
        }
    }

    return { save, load, fetchLeaderboard, getDeviceId: _getDeviceId };
})();

window.CloudSave = CloudSave;
