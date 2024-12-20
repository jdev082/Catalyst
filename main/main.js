/* eslint-enable no-undef */
/* eslint-enable no-unused-vars */
const { ElectronBlocker } = require('@cliqz/adblocker-electron');
const { app, BrowserWindow, Menu, session, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const contextMenu = require('electron-context-menu');
const parse = require('bookmarks-parser');

if (require('electron-squirrel-startup')) app.quit();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            webviewTag: true,
            devTools: true,
            sandbox: false,
            preload: path.join(__dirname, 'preload.js'),
            spellcheck: true
        },
        title: 'Catalyst',
        icon: path.join(__dirname, '../assets/icon.png'),
    });
    mainWindow.loadFile('./src/index.html');
    mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        callback(mainWindow.webContents.executeJavaScript(`confirm('This page has requested the following permission: ${permission}')`));
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
app.on('web-contents-created', function (event, contents) {
    if (contents.getType() === 'webview') {
        contents.on('new-window', function (newWindowEvent) {
            newWindowEvent.preventDefault();
        });
    }
    contents.setWindowOpenHandler(({ url }) => {
        if (mainWindow.webContents
            .executeJavaScript('JSON.parse(localStorage.getItem("preferences")).osb')
            .then(localStorage => {
                if (localStorage) {
                    mainWindow.webContents.executeJavaScript(`openInSidebar('${url}')`);

                } else {
                    mainWindow.webContents.executeJavaScript(`createTab('${url}')`);
                }
            }))
            return { action: 'deny' };
    });
});

try {
    require('electron-reloader')(module);
} catch { }

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        minWidth: 500,
        minHeight: 250,
        width: 550,
        height: 200,
        title: 'About Catalyst',
        icon: path.join(__dirname, '../assets/icon.png'),
        resizable: false,
    });
    aboutWindow.loadFile('./src/about.html');
    aboutWindow.setMenuBarVisibility(false);

}

const template = [{
    label: 'About',
    click: function () {
        createAboutWindow();
    }
},
{
    label: 'Quit',
    click: function () {
        app.quit();
    }
},
{
    label: 'Hide',
    accelerator: 'CmdOrCtrl+H',
    click: function () {
        mainWindow.setMenuBarVisibility(false);
    }
},
{
    label: 'Show',
    accelerator: 'CmdOrCtrl+S',
    click: function () {
        mainWindow.setMenuBarVisibility(true);
    }
},
{
    label: 'New Tab',
    accelerator: 'CmdOrCtrl+T',
    click: function () {
        mainWindow.webContents.executeJavaScript('createTab()');
    }
},
{
    label: 'Close Tab',
    accelerator: 'CmdOrCtrl+W',
    click: function () {
        mainWindow.webContents.executeJavaScript('removeTab()');
    }
},
{
    label: 'Fullscreen',
    accelerator: 'F11',
    click: function () {
        mainWindow.webContents.executeJavaScript('toggleFullScreen()');
    }
},
{
    label: 'Find',
    accelerator: 'CmdOrCtrl+F',
    click: function () {
        mainWindow.webContents.executeJavaScript('toggleFind()');
    }
},
{
    label: 'DevTools',
    accelerator: 'CmdOrCtrl+I',
    click: function () {
        mainWindow.webContents.toggleDevTools();
    },
},
{
    label: 'Import Bookmarks',
    accelerator: 'CmdOrCtrl+H',
    click: function() {

        dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections']
        }).then(result => {
            if (!result.canceled) {
                const filePaths = result.filePaths;  
                const file = filePaths[0];
                try {
                    const buf = fs.readFileSync(file, { encoding: 'utf8', flag: 'r' });
                    parse(buf, function(e,r) {
                        console.log(e);
                        console.log(r['bookmarks'][0].children);
                        marks = r['bookmarks'][0].children;
                        for (var i = 0; i < marks.length; i++) 
                        { 
                            url = marks[i]['url']; 
                            title = marks[i]['title'];
                            js = `progBookmarkTab("${url}", "${title}")`;
                            console.log(url);
                            mainWindow.webContents.executeJavaScript(js);
                        }
                    });
                } catch {
                    return;
                }
            }
        }).catch(err => {
            console.error('Error opening file dialog:', err);
        });
    }
}];

app.on('web-contents-created', (e, contents) => {
    contextMenu({
        window: contents,
        showSaveImageAs: true,
        showSaveImage: true,
        showInspectElement: true,
        showLearnSpelling: true,
        showSearchWithGoogle: true,
        showSelectAll: true,
        showCopyImageAddress: true,
        showCopyVideoAddress: true,
        showSaveVideoAs: true,
        showCopyLink: true,
        prepend: (defaultActions, parameters, browserWindow) => [
            {
                label: 'Search for "{selection}"',
                visible: parameters.selectionText.trim().length > 0,
                click: () => {
                    mainWindow.webContents.executeJavaScript(`loadURL("${parameters.selectionText.trim()}")`);
                }
            },
            {
                label: 'Open link in new tab',
                visible: parameters.linkURL,
                click: () => {
                    mainWindow.webContents.executeJavaScript(`createTab('${parameters.linkURL}')`);
                }
            },
            {
                label: 'Open link in sidebar',
                visible: parameters.linkURL,
                click: () => {
                    mainWindow.webContents.executeJavaScript(`sb.src = '${parameters.linkURL}'`);
                }
            }
        ]
    });
    
});

ipcMain.handle('enable-ad-blocker', (event) => {
    ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
        blocker.enableBlockingInSession(session.defaultSession);
    });
});

ipcMain.handle('loadExt', async (event, ext) => {
    session.defaultSession.loadExtension(ext);
});

ipcMain.handle('read-user-data', async (event, fileName) => {
    const path = app.getPath('userData');
    try {
        const buf = fs.readFileSync(`${path}/${fileName}`, { encoding: 'utf8', flag: 'r' });
        return buf;
    } catch {
        return;
    }
});

if (!fs.existsSync(`${app.getPath('userData')}/themes`)) {
    fs.mkdirSync(`${app.getPath('userData')}/themes`);
}

ipcMain.handle('get-themes', async (event) => {
    const path = app.getPath('userData');
    const buf = fs.readdirSync(`${path}/themes`, { encoding: 'utf8', flag: 'r' });
    return buf;
});

function download(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(cb);
        });
    });
}

ipcMain.handle('download-theme', async (event, url, name) => {
    download(url, `${app.getPath('userData')}/themes/${name}`, () => {
        return;
    });
});

ipcMain.handle('toggle-full-screen', async (event) => {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
});

ipcMain.handle('set-titlebar-title', async (event, title) => {
    mainWindow.title = 'Catalyst - ' + title;
}); 

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);