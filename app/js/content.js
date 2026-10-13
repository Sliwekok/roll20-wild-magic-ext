// Chat commands are matched against the *body* of a Roll20 chat message only.
// Roll20 renders a message as
//   <div class="message general" data-messageid="...">
//     <div class="spacer"></div><div class="avatar">..</div>
//     <span class="tstamp">7:42PM</span><span class="by">Dominik:</span>help
//   </div>
// but drops the avatar/tstamp/by header when the same person posts several
// messages in a row. Using node.textContent therefore gave "7:42PMDominik:help"
// for the first message of a group and "help" for the rest - which is why
// startsWith('help') / startsWith('time') only matched *sometimes*.

const COMMANDS = [
    { re: /^wild_magic\b/i, type: 'WILD_MAGIC_TRIGGER', name: 'wild_magic' },
    { re: /^help\b/i,       type: 'HELP_TRIGGER',       name: 'help' },
    { re: /^time\b/i,       type: 'TIME_TRIGGER',       name: 'time' },
];

// Parts of a message that are not what the user typed.
const HEADER_SELECTOR = '.spacer, .avatar, .tstamp, .by, .flyout';

// After attaching, ignore messages until the chat has been quiet this long, so
// the chat archive Roll20 renders on load doesn't re-fire old commands.
const QUIET_MS = 1500;
const DEDUPE_TTL_MS = 3000;

function onReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(fn, 0);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function findChatLog() {
    // `.content` alone matches the first .content anywhere on the page, which
    // is not necessarily the chat log.
    return document.querySelector('#textchat .content');
}

function getMessageBody(messageEl) {
    const clone = messageEl.cloneNode(true);
    clone.querySelectorAll(HEADER_SELECTOR).forEach(el => el.remove());
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
}

function getMessageElements(node) {
    if (node.nodeType !== 1) return [];
    if (node.matches('.message')) return [node];
    return Array.from(node.querySelectorAll('.message'));
}

function sendTrigger(type) {
    try {
        chrome.runtime.sendMessage({ type });
    } catch (err) {
        // Happens after the extension is reloaded while this tab stays open:
        // the old content script is orphaned until the Roll20 tab is refreshed.
        console.warn('[wild-magic] Could not reach the extension - refresh the Roll20 tab.', err);
    }
}

onReady(() => {
    let currentLog = null;
    let observer = null;
    let live = false;
    let quietTimer = null;
    const seenIds = new Set();
    const recentBodies = new Set();

    function armQuietTimer() {
        clearTimeout(quietTimer);
        quietTimer = setTimeout(() => {
            live = true;
            console.log('[wild-magic] Listening for chat commands');
        }, QUIET_MS);
    }

    function handleMessage(messageEl) {
        const id = messageEl.getAttribute('data-messageid');
        if (id) {
            if (seenIds.has(id)) return;
            seenIds.add(id);
        }
        if (!live) return;

        const body = getMessageBody(messageEl);
        if (!body) return;

        const command = COMMANDS.find(c => c.re.test(body));
        if (!command) return;

        // Fallback dedupe for messages without an id.
        if (!id) {
            const key = command.name + '|' + body.toLowerCase();
            if (recentBodies.has(key)) return;
            recentBodies.add(key);
            setTimeout(() => recentBodies.delete(key), DEDUPE_TTL_MS);
        }

        console.log(`[wild-magic] Matched ${command.name} - TRIGGERED`, body);
        sendTrigger(command.type);
    }

    function attach(log) {
        if (observer) observer.disconnect();
        currentLog = log;
        live = false;

        // Whatever is already rendered is history, not a new command.
        log.querySelectorAll('.message').forEach(el => {
            const id = el.getAttribute('data-messageid');
            if (id) seenIds.add(id);
        });

        // Process every mutation batch as it arrives. (The previous 100 ms
        // debounce cleared the pending timeout and only ever processed the
        // *last* batch, silently dropping messages that arrived close together.)
        observer = new MutationObserver((mutations) => {
            if (!live) armQuietTimer();
            for (const mutation of mutations) {
                if (mutation.type !== 'childList') continue;
                mutation.addedNodes.forEach(node => getMessageElements(node).forEach(handleMessage));
            }
        });
        observer.observe(log, { childList: true, subtree: false });
        armQuietTimer();
        console.log('[wild-magic] Observer attached');
    }

    function ensureAttached() {
        const log = findChatLog();
        if (log && log !== currentLog) attach(log);
        return !!log;
    }

    if (!ensureAttached()) {
        const bodyObserver = new MutationObserver(() => {
            if (ensureAttached()) bodyObserver.disconnect();
        });
        bodyObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Roll20 can rebuild the chat panel (reconnects, layout changes); re-attach
    // if the element we observe has been replaced.
    setInterval(() => {
        if (!currentLog || !currentLog.isConnected) ensureAttached();
    }, 5000);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'WILD_MAGIC_ROLLED') {
        console.log('Wild magic triggered from content script');

        if (message.wildMagic.error) return;
        // send to chat
        let command = "/w sliwekok Wild Magic Surge! Rolled D100: " + message.wildMagic.d100 + ", D20: " + message.wildMagic.d20 + ". Effect: " + message.wildMagic.description;
        waitForChatAndSend(command);
    }

    if (message.type === 'HELP_ROLLED') {
        console.log('HELP triggered from content script');

        if (message.help.error) return;
        // send to chat
        let command = message.help.message;
        waitForChatAndSend(command);
    }

    if (message.type === 'TIME_ROLLED') {
        console.log('TIME triggered from content script');

        if (message.time.error) return;
        // send to chat
        let command = message.time.message;
        waitForChatAndSend(command);
    }
});

function waitForChatAndSend(command, retries = 3) {
    const textarea = document.querySelector('#textchat-input textarea');
    const button = document.querySelector('#chatSendBtn');

    if (textarea && button) {
        textarea.value = command;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        button.click();
        textarea.value = '';
        return;
    }

    if (retries > 0) {
        setTimeout(() => waitForChatAndSend(command, retries - 1), 100);
    } else {
        console.log('Chat not found after retries');
    }
}
