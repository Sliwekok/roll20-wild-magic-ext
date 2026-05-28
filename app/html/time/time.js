import {Time} from '../../js/Time.js';

const datetimeEl = document.getElementById('datetime');
const labelEl = document.getElementById('label');
const saveBtn = document.getElementById('saveBtn');
const nowBtn = document.getElementById('nowBtn');
const clearBtn = document.getElementById('clearBtn');
const historyList = document.getElementById('historyList');
var deleteItem = document.querySelector('.deleteItem');

async function refreshList() {
    const list = await Time.getTimes();
    historyList.innerHTML = '';
    if (!list.length) {
        const li = document.createElement('li');
        li.textContent = 'Brak zapisanych czasów.';
        historyList.appendChild(li);
        return;
    }

    list.forEach((item, key) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.display}</strong>${item.label ? ' — ' + escapeHtml(item.label) : ''}
            <div class="meta">ts: ${item.ts}</div>
            <div class="deleteItem">
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" 
                     height="24" 
                     viewBox="0 0 24 24" 
                     fill="none">
                    
                    <line x1="5" y1="5" x2="19" y2="19"
                          stroke="currentColor"
                          stroke-width="2.5"
                          stroke-linecap="round"/>
                
                    <line x1="19" y1="5" x2="5" y2="19"
                          stroke="currentColor"
                          stroke-width="2.5"
                          stroke-linecap="round"/>
                </svg>
            </div>
            `;
        li.setAttribute('data-key', key);
        historyList.appendChild(li);
    });

    deleteItem = document.querySelector('.deleteItem');
    reAssignDeletes();
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

if (deleteItem) {
    deleteItem.addEventListener('click', async () => {
        const key = this.parentNode.getAttribute('data-key');
        console.log(key);
        await Time.deleteTime(key)
    })
}

function reAssignDeletes() {
    if (deleteItem) {
        deleteItem.addEventListener('click', async () => {
            console.log('event');
            const key = this.parentElement.getAttribute('data-key');

            await Time.deleteTime(key)
        })
    }
}

refreshList();
