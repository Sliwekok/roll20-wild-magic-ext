import { WildMagic } from './WildMagic.js';
import { Help } from "./Help.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'WILD_MAGIC_TRIGGER') {
        console.log('Wild magic triggered from content script');

        WildMagic.doRollHidden().then(data => {
            if (!sender.tab?.id) return;

            chrome.tabs.sendMessage(sender.tab.id, {
                type: 'WILD_MAGIC_ROLLED',
                wildMagic: data
            });
        });
    }

    if (message.type === 'HELP_TRIGGER') {
        console.log('Help triggered from content script');

        Help.getHelp().then(data => {
            if (!sender.tab?.id) return;

            chrome.tabs.sendMessage(sender.tab.id, {
                type: 'HELP_ROLLED',
                help: data
            });
        });
    }
});
