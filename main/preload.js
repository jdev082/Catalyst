const path = require('path');
const { ipcRenderer, contextBridge } = require('electron');

const dat = require(path.join(__dirname, '../package.json'),);

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('ver').innerText = 'v' + dat.version;
    document.getElementById('pref-ver').innerText = 'v' + dat.version;
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
    enableAdBlocker: (id) => ipcRenderer.invoke('enable-ad-blocker', id),
    ipcToggleFs: () => ipcRenderer.invoke('toggle-full-screen'),
    setTitlebarTitle: (title) => {
        ipcRenderer.invoke('set-titlebar-title', title);
    },
    setPermissionHandler: (id) => {
        ipcRenderer.invoke('set-permission-handler', id)
    }
});
