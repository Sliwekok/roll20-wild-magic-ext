export const Time = (() => {
    const STORAGE_KEY = 'time';
    const MAX_ITEMS = 100;

    function formatEntry(ts, label = '') {
        const date = new Date(Number(ts));
        return {
            ts: Number(ts),
            display: date.toLocaleString(),
            label: typeof label === 'string' ? label : ''
        };
    }

    function getTimes() {
        return new Promise(resolve => {
            if (!chrome?.storage) return resolve([]);
            chrome.storage.local.get([STORAGE_KEY], res => {
                const list = Array.isArray(res[STORAGE_KEY]) ? res[STORAGE_KEY] : [];
                resolve(list);
            });
        });
    }

    function addTime(value, label = '') {
        // value może być:
        // - liczba (ms od epoch)
        // - string parsowalny przez Date.parse (np. "2026-05-26T12:00")
        // - Date obiekt
        let ts;
        if (typeof value === 'number') {
            ts = value;
        } else if (value instanceof Date) {
            ts = value.getTime();
        } else if (typeof value === 'string') {
            ts = Date.parse(value);
            if (isNaN(ts)) {
                ts = Date.now();
            }
        } else {
            ts = Date.now();
        }

        const entry = formatEntry(ts, label);

        return new Promise(resolve => {
            if (!chrome?.storage) return resolve();
            chrome.storage.local.get([STORAGE_KEY], res => {
                const list = Array.isArray(res[STORAGE_KEY]) ? res[STORAGE_KEY] : [];
                list.unshift(entry);
                if (list.length > MAX_ITEMS) list.length = MAX_ITEMS;
                chrome.storage.local.set({ [STORAGE_KEY]: list }, () => resolve());
            });
        });
    }

    function clearTimes() {
        return new Promise(resolve => {
            if (!chrome?.storage) return resolve();
            chrome.storage.local.set({ [STORAGE_KEY]: [] }, () => resolve());
        });
    }

    function deleteTime (key) {
        console.log(key);
        return new Promise(resolve => {
            if (!chrome?.storage) return resolve();
            console.log('to _delete');
            chrome.storage.local.removeItem(key, () => resolve());
        })
    }

    return {
        getTimes,
        addTime,
        clearTimes,
        deleteTime
    };
})();
