import { WildMagic } from './WildMagic.js';

function openHistory() {
  const url = chrome.runtime.getURL('history.html');
  window.open(url, '_blank');
}

document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('rollBtn');
  btn.addEventListener('click', () => WildMagic.doRollAndShow());
  const historyBtn = document.getElementById('historyBtn');
  if (historyBtn) historyBtn.addEventListener('click', openHistory);
});
