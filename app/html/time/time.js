import {Time} from 'app/js/Time.js';

const datetimeEl = document.getElementById('datetime');
const labelEl = document.getElementById('label');
const saveBtn = document.getElementById('saveBtn');
const nowBtn = document.getElementById('nowBtn');
const clearBtn = document.getElementById('clearBtn');
const historyList = document.getElementById('historyList');

async function refreshList() {
    const list = await Time.getTimes();
    historyList.innerHTML = '';
    if (!list.length) {
        const li = document.createElement('li');
        li.textContent = 'Brak zapisanych czasów.';
        historyList.appendChild(li);
        return;
    }

    list.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.display}</strong>${item.label ? ' — ' + escapeHtml(item.label) : ''}
            <div class="meta">ts: ${item.ts}</div>`;
        historyList.appendChild(li);
    });
}

function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

saveBtn.addEventListener('click', async () => {
    const dt = datetimeEl.value; // format: "YYYY-MM-DDTHH:MM"
    const label = labelEl.value.trim();
    if (!dt) {
        alert('Wybierz datę i godzinę albo użyj "Zapisz teraz".');
        return;
    }
    await Time.addTime(dt, label);
    await refreshList();
});

nowBtn.addEventListener('click', async () => {
    const label = labelEl.value.trim();
    await Time.addTime(Date.now(), label);
    await refreshList();
});

clearBtn.addEventListener('click', async () => {
    if (!confirm('Czy na pewno usunąć całą historię?')) return;
    await Time.clearTimes();
    await refreshList();
});

refreshList();
