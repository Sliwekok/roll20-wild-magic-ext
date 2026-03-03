function onReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(fn, 0);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

onReady(() => {
    function attachObserver() {
        const content = document.querySelector('.content');
        if (!content) return false;

        console.log('Observer attached');

        let initialized = false;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type !== 'childList') return;

                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType !== 1) return;

                    const text = node.textContent?.trim();
                    console.log('New node text:', text);

                    if (text && text.toLowerCase().includes('wild_magic') && initialized) {
                        console.log('Matched wild_magic');

                        chrome.runtime.sendMessage({
                            type: 'WILD_MAGIC_TRIGGER'
                        });
                    }
                });
            });

            initialized = true;
        });

        observer.observe(content, {
            childList: true,
            subtree: false
        });

        return true;
    }

    if (attachObserver()) return;

    const bodyObserver = new MutationObserver(() => {
        if (attachObserver()) {
            bodyObserver.disconnect();
        }
    });

    bodyObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'WILD_MAGIC_ROLLED') {
        console.log('Wild magic triggered from content script');

        if (message.wildMagic.error) return;
        // send to chat
        let command = "/w sliwekok Wild Magic Surge! Rolled D100: " + message.wildMagic.d100 + ", D20: " + message.wildMagic.d20 + ". Effect: " + message.wildMagic.description;
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
