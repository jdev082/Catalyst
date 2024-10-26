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
    getPlugins: () => {
        const themes = ipcRenderer.invoke('get-plugins').then(
            result => {
                let pluginName = result[x]
                let pname = pluginName.replace(".js", "")
                for (x in result) {
                    file = ipcRenderer.invoke('read-user-data', `plugins/${result[x]}`).then(
                        result => {
                            let area = document.getElementById('plugins')
                            let div = document.createElement('div')
                            div.classList.add("toggle-area")
                            let name = document.createElement('p')
                            name.innerText = pname;
                            let toggle = document.createElement('input')
                            toggle.type = 'checkbox'
                            toggle.id = pname;
                            div.appendChild(name)
                            div.appendChild(toggle)
                            area.appendChild(div)


                            document.getElementById(`${pname}`).addEventListener('change', () => {
                                localStorage.setItem(`catalyst.plugins.${pname}`, document.getElementById(`${pname}`).checked)
                            })

                            if (localStorage.hasOwnProperty(`catalyst.plugins.${pname}`)) {
                                let enabled = localStorage.getItem(`catalyst.plugins.${pname}`) === "true";
                                document.getElementById(`${pname}`).checked = enabled
                                if (enabled && isValid(result)) {
                                    let sandbox = document.createElement('iframe')
                                    sandbox.srcdoc = `<script src="./extend.js"></script><script>${result}</script>`
                                    sandbox.display = "none";
                                    sandbox.sandbox = "allow-scripts allow-same-origin"
                                    document.head.appendChild(sandbox)
                                } else {
                                    console.log(`Plugin ${pname} is invalid.`)
                                    return;
                                }
                            }
                            
                        }
                    )
                }
            }
        )
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

