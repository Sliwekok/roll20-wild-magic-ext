export const Time = (() => {
    async function getTime() {

    }

    async function setTime(time) {
        var time = formatTime(time);
        if (!chrome?.storage) return Promise.resolve();
        return new Promise(resolve => {
            chrome.storage.local.get(['time'], res => {
                const list = Array.isArray(res.time) ? res.time : [];
                list.unshift(time);
                if (list.length > 100) list.length = 100;
                chrome.storage.local.set({ time: list }, () => resolve());
            });
        });
    }

    function formatTime(time) {

    }

    return {
        getTime
    };
})();
