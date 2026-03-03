// history.js: shows saved rolls from chrome.storage.local

function renderHistory(list) {
  const container = document.getElementById('historyList');
  if (!container) return;
  if (!list || list.length === 0) {
    container.innerHTML = '<div class="description">Brak zapisanych rzutów.</div>';
    return;
  }
  container.innerHTML = list.map(item => {
    const time = new Date(item.ts).toLocaleString();
    return `<div style="margin-bottom:8px;padding:8px;border-radius:8px;background:rgba(255,255,255,0.02)">` +
      `<div style="font-weight:700">${time} — D100: ${item.d100} | D20: ${item.d20} — <span style="font-weight:800">${item.type}</span></div>` +
      `<div style="margin-top:6px">${item.description}</div>` +
      `</div>`;
  }).join('');
}

function loadHistory() {
  if (!chrome || !chrome.storage) return Promise.resolve([]);
  return new Promise(resolve => {
    chrome.storage.local.get(['rollHistory'], res => {
      resolve(Array.isArray(res.rollHistory) ? res.rollHistory : []);
    });
  });
}

function clearHistory() {
  return new Promise(resolve => {
    chrome.storage.local.set({ rollHistory: [] }, () => resolve());
  });
}

function copyHistoryToClipboard(list) {
  const text = list.map(i => `${new Date(i.ts).toLocaleString()} — D100:${i.d100} D20:${i.d20} [${i.type}] ${i.description}`).join('\n\n');
  navigator.clipboard.writeText(text);
}

document.addEventListener('DOMContentLoaded', async () => {
  const clearBtn = document.getElementById('clearBtn');
  const exportBtn = document.getElementById('exportBtn');

  const list = await loadHistory();
  renderHistory(list);

  clearBtn.addEventListener('click', async () => {
    await clearHistory();
    renderHistory([]);
  });

  exportBtn.addEventListener('click', async () => {
    const current = await loadHistory();
    copyHistoryToClipboard(current);
    exportBtn.textContent = 'Copied';
    setTimeout(() => exportBtn.textContent = 'Copy', 1200);
  });
});
