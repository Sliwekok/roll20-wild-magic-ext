import { WildMagic } from './WildMagic.js';

(function () {
  function onReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(fn, 0);
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  onReady(function () {
    console.log('fired');
    document.querySelector('.content').addEventListener('change', function(e) {
      // fetch the newest text from class message
        let message = this.lastChild.textContent;
        console.log(message);
        if (message == 'wild_magic') {
          console.log('matched');
          // send message to popup to trigger roll
          WildMagic.doRollAndShow();
        }
    });
  });
})();
