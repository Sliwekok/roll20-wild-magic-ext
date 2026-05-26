import { WildMagic } from './WildMagic.js';

function openHistory() {
  const url = chrome.runtime.getURL('./app/html/wildMagic/history.html');
  window.open(url, '_blank');
}
function openWildMagic() {
  const url = chrome.runtime.getURL('./app/html/wildMagic/index.html');
    window.open(url, '_blank');
}
function openIndex() {
  const url = chrome.runtime.getURL('./app/html/index.html');
    window.open(url, '_blank');
}

document.addEventListener('DOMContentLoaded', function () {
  const historyBtn = document.getElementById('historyBtn');
  if (historyBtn) historyBtn.addEventListener('click', openHistory);

  const wildMagicIndexBtn = document.getElementById('wildMagicIndexBtn');
  if (wildMagicIndexBtn) wildMagicIndexBtn.addEventListener('click', openWildMagic);

  const indexBtn = document.querySelector('.indexBtn');
  if (indexBtn) indexBtn.addEventListener('click', openIndex);
});
