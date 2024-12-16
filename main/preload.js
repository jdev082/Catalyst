const path = require('path');
const { ipcRenderer, contextBridge } = require('electron');
const i18n = require('vanilla-i18n')
const es = require('../langs/es.js')

const dat = require(path.join(__dirname, '../package.json'),);

function applyTranslations(element) {
    var all = document.body.getElementsByTagName(element);

    for (var i = 0, max = all.length; i < max; i++) {
        if (all[i].querySelector("span") == null) {
            all[i].innerText = all[i].innerText.translate(lang)
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('ver').innerText = 'v' + dat.version;
    document.getElementById('pref-ver').innerText = 'v' + dat.version;

        lang = localStorage.getItem('catalyst.localization.language')
        switch(lang) {
            case "es":
                i18n.setTranslate(es, 'es')
                break;
            default:
                break;
        }
        i18n.setTranslate(lang, lang)
        applyTranslations('button', lang)
        applyTranslations('p', lang)
        applyTranslations('h1', lang)
        applyTranslations('h2', lang)
        applyTranslations('h3', lang)
        applyTranslations('li', lang)
        applyTranslations('label', lang)
        applyTranslations('button', lang)
});

contextBridge.exposeInMainWorld('native', {
    loadExt: (ext) => {
        ipcRenderer.invoke('loadExt', ext);
    },
    loadCustomStyles: () => {
        const file = ipcRenderer.invoke('read-user-data', 'userChrome.css').then(
            result => {
                let el = document.createElement('style');
                el.type = 'text/css';
                el.innerText = result;
                document.head.appendChild(el);
            }
        );
    },
    getThemes: () => {
        const themes = ipcRenderer.invoke('get-themes').then(
            result => {
                themeSelect = document.getElementById('pref-theme');
                for (x in result) {
                    if (!result[x].endsWith('.css')) {
                    } else {
                        let sel = document.createElement('option');
                        sel.value = result[x];
                        sel.innerText = result[x].replace('.css', '');
                        themeSelect.appendChild(sel);
                    }
                }
            }
        );
    },
    loadTheme: (theme) => {
        const file = ipcRenderer.invoke('read-user-data', `themes/${theme}`).then(
            result => {
                let el = document.createElement('style');
                el.type = 'text/css';
                el.innerText = result;
                el.classList.add('theme');
                document.head.appendChild(el);
            }
        );
    },
    downloadTheme: (url, name) => {
        ipcRenderer.invoke('download-theme', url, name);
    },
    unloadTheme: () => {
        document.getElementsByClassName('theme')[0].remove();
    },
    enableAdBlocker: () => ipcRenderer.invoke('enable-ad-blocker'),
    ipcToggleFs: () => ipcRenderer.invoke('toggle-full-screen'),
});
