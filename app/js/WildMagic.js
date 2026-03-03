// WildMagic.js
export const WildMagic = (() => {
    // --- Core data loader ---
    async function loadData() {
        const url = chrome.runtime.getURL('assets/wild_magic.json');
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load wild_magic.json: ' + res.status);
        return await res.json();
    }

    // --- Dice helpers ---
    function rollDie(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    function findRangeEntry(obj, value) {
        for (const rangeKey of Object.keys(obj)) {
            const m = rangeKey.match(/^(\d+)-(\d+)$/);
            if (!m) continue;
            const a = parseInt(m[1], 10);
            const b = parseInt(m[2], 10);
            if (value >= a && value <= b) return obj[rangeKey];
        }
        return null;
    }

    function mapRollsToEffect(data, d100, d20) {
        const outerKey = String(Math.ceil(d100 / 20));
        const outer = data[outerKey];
        if (!outer) return { error: 'No mapping for outer key ' + outerKey };
        const entry = findRangeEntry(outer, d20);
        if (!entry) return { error: 'No inner range matched for d20=' + d20 };
        return { outerKey, d100: d100, d20: d20, type: entry.type, description: entry.description };
    }

    // --- DOM helpers ---
    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function setHTML(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }

    function showSpinner(show) {
        const s = document.getElementById('spinner');
        if (!s) return;
        s.classList.toggle('visible', show);
    }

    function flashBadge(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('pop');
        void el.offsetWidth; // force reflow
        el.classList.add('pop');
    }

    function setTypeBadge(type) {
        const el = document.getElementById('typeBadge');
        if (!el) return;
        el.className = 'type-badge';
        if (type === 'bad') el.classList.add('bad');
        else if (type === 'good') el.classList.add('good');
        else el.classList.add('neutral');
        el.textContent = type || '—';
    }

    // --- Storage helpers ---
    function appendHistoryItem(item) {
        if (!chrome?.storage) return Promise.resolve();
        return new Promise(resolve => {
            chrome.storage.local.get(['rollHistory'], res => {
                const list = Array.isArray(res.rollHistory) ? res.rollHistory : [];
                list.unshift(item);
                if (list.length > 100) list.length = 100;
                chrome.storage.local.set({ rollHistory: list }, () => resolve());
            });
        });
    }

    // --- Public roll function ---
    async function doRollAndShow() {
        const btn = document.getElementById('rollBtn');
        const debug = document.getElementById('debug');

        btn.disabled = true;
        showSpinner(true);
        setText('description', 'Losowanie...');
        setText('d100Badge', 'D100: —');
        setText('d20Badge', 'D20: —');
        setTypeBadge('');
        debug.hidden = true;

        try {
            const data = await loadData();
            await new Promise(r => setTimeout(r, 250)); // small delay for spinner
            const d100 = rollDie(100);
            const d20 = rollDie(20);
            const mapped = mapRollsToEffect(data, d100, d20);

            if (mapped.error) {
                setHTML('description', `<strong>Error:</strong> ${mapped.error}`);
                debug.hidden = false;
                debug.textContent = JSON.stringify({ d100, d20, mapped }, null, 2);
            } else {
                setText('d100Badge', `D100: ${mapped.d100}`);
                setText('d20Badge', `D20: ${mapped.d20}`);
                flashBadge('d100Badge');
                flashBadge('d20Badge');
                setTypeBadge(mapped.type);
                setText('description', mapped.description);

                await appendHistoryItem({
                    ts: Date.now(),
                    d100: d100,
                    d20: d20,
                    type: mapped.type ?? '',
                    description: mapped.description ?? ''
                });
            }
        } catch (err) {
            setHTML('description', `<strong>Error:</strong> ${err.message || err}`);
            debug.hidden = false;
            debug.textContent = String(err);
        } finally {
            showSpinner(false);
            btn.disabled = false;
        }
    }

    async function doRollHidden() {
        try {
            const data = await loadData();
            const d100 = rollDie(100);
            const d20 = rollDie(20);
            const mapped = mapRollsToEffect(data, d100, d20);

            if (mapped.error) {
                console.error('Error mapping rolls:', mapped.error);
                return null;
            } else {
                await appendHistoryItem({
                    ts: Date.now(),
                    d100: d100,
                    d20: d20,
                    type: mapped.type ?? '',
                    description: mapped.description ?? ''
                });

                return mapped;
            }
        } catch (err) {
            console.error('Error in doRollHidden:', err);
            return null;
        }
    }

    // --- Exports ---
    return {
        doRollAndShow,
        loadData,
        rollDie,
        mapRollsToEffect,
        appendHistoryItem,
        doRollHidden
    };
})();
