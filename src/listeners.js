// dependencies
strt = document.querySelector('#pref-strt');
reload = document.querySelector('#reload');
backward = document.querySelector('#back');
forward = document.querySelector('#forward');
bkmrk = document.querySelector('#bkmtggl');
find = document.querySelector('#find');
sidebar = document.querySelector('#tgl-sidebar');

bkmrk.addEventListener('click', () => {
    toggleBookmarks();
});

document.getElementById('more-btn').addEventListener('click', () => {
    toggleDisplay(document.getElementById('more-menu'));
    document.querySelector('#more-btn').classList.toggle('bg-indigo-400');
});

strt.addEventListener('keypress', (e) => {
    if (e.keyCode == 13) {
        if (strt.value.includes('\'') || strt.value.includes('"')) {
            alert('Invalid characters. Must not contain quotes!');
            return;
        }
        if (strt.value == 'default') {
            localStorage.setItem('ctlyststrppg', './home.html');
            return;
        }
        localStorage.setItem('ctlyststrppg', strt.value);
        alert('Browser must be restarted to complete change.');
    }}
);
strt.value = localStorage.getItem('ctlyststrppg');

reload.addEventListener('click', () => {
    document.querySelector('.current').reload();
});

forward.addEventListener('click', () => {
    document.querySelector('.current').goForward();
});

backward.addEventListener('click', () => {
    document.querySelector('.current').goBack();
});

find.addEventListener('input', (event) => {
    if (find.value !== '') {
        document.querySelector('.current').findInPage(find.value);
    } else {
        document.querySelector('.current').stopFindInPage('clearSelection');
    }
});

sidebar.addEventListener('click', () => {
    toggleDisplay(document.getElementById('sidebar'));
});