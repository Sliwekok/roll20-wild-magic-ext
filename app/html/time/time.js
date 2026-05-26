// function renderHistory(list) {
//     const container = document.getElementById('timeList');
//     if (!container) return;
//     if (!list || list.length === 0) {
//         container.innerHTML = '<div class="description">Brak zapisanych czasów.</div>';
//         return;
//     }
//     container.innerHTML = list.map(item => {
//         const time = new Date(item.ts).toLocaleString();
//         return `<div style="margin-bottom:8px;padding:8px;border-radius:8px;background:rgba(255,255,255,0.02)">` +
//             `<div style="font-weight:700">Czas: <span style="font-weight:800">${item.time}</span></div>` +
//             `<div style="margin-top:6px">${item.created_at}</div>` +
//             `</div>`;
//     }).join('');
// }
//
// function loadHistory() {
//     if (!chrome || !chrome.storage) return Promise.resolve([]);
//     return new Promise(resolve => {
//         chrome.storage.local.get(['timeHistory'], res => {
//             resolve(Array.isArray(res.timeHistory) ? res.timeHistory : []);
//         });
//     });
// }
//
// function clearHistory() {
//     return new Promise(resolve => {
//         chrome.storage.local.set({ timeHistory: [] }, () => resolve());
//     });
// }
// document.addEventListener('DOMContentLoaded', async () => {
//     const clearBtn = document.getElementById('clearBtn');
//
//     const list = await loadHistory();
//     renderHistory(list);
//
//     clearBtn.addEventListener('click', async () => {
//         await clearHistory();
//         renderHistory([]);
//     });
// });
