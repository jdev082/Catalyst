// add startup code here
// dont touch this, it makes the loading screen work
var sb = document.getElementById('sb');

if(document.readyState === 'ready' || document.readyState === 'complete') {
    document.getElementById('loading').classList.add('hidden');
} else {
    document.onreadystatechange = function () {
        if (document.readyState == 'complete') {
            document.getElementById('loading').classList.add('hidden');
        }
    };
}

if (localStorage.getItem('bookmarks') < 1) {
    document.querySelector('#bookmarks').innerText = 'When you add bookmarks they will appear here!';
}

native.getThemes();

sbwv = document.getElementById('sidebarwv');
sbwv.addEventListener('did-attach', () => {
    sbwv.src = 'https://' + engineurls[preferences.searchengine].split('/')[2];
});

