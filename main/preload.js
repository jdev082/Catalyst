const path = require('path');
const { Titlebar } = require("custom-electron-titlebar");

const dat = require(path.join(__dirname, '../package.json'),);

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('ver').innerText = 'v' + dat.version;
    document.getElementById('pref-ver').innerText = 'v' + dat.version;
    new Titlebar({
        backgroundColor: 'white'
    });
});