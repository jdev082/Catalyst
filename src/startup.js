// add startup code here
// dont touch this, it makes the loading screen work
var sb = document.getElementById('sb')

if(document.readyState === 'ready' || document.readyState === 'complete') {
    document.getElementById('loading').classList.add('hidden');
} else {
    document.onreadystatechange = function () {
        if (document.readyState == 'complete') {
            document.getElementById('loading').classList.add('hidden');
        }
    };
}

if (!localStorage.getItem('home-postfix')) {
    var ctlyststrppg = './home.html';
    localStorage.setItem('home-postfix', 'true');
}

if (localStorage.getItem('bookmarks') < 1) {
    document.querySelector('#bookmarks').innerText = 'When you add bookmarks they will appear here!';
}

native.getThemes();

var engine = localStorage.getItem('engine')

sbwv.addEventListener('did-attach', () => {
    sbwv.src = engineurls[engine];
})

