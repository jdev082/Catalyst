// search engine globals
const engineurls = [
    'https://www.google.com/search?q=',
    'https://duckduckgo.com/?q=',
    'https://www.bing.com/search?q=',
    'https://search.brave.com/search?q=',
    'https://www.ecosia.org/search?method=index&q='
];

// protocols
const protocols = ['https', 'http', 'file', 'data', 'catalyst'];
const searchbar = document.getElementById('searchbar');
const suggestionsEl = document.getElementById('suggestions');
searchbar.addEventListener('input', async() => {
    if (searchbar.value.length < 1) {
        removeChildren(suggestionsEl);
        return;
    }
    if (engineSupportsAC()) {
        if (
            shouldAutocomplete(searchbar.value) &&
        JSON.parse(window.localStorage.getItem('preferences')).autocomplete
        ) {
        // This is for duckduckgo only, in the future, this may be something else, but I think DDG is fine for now.
            const autoCompleteCheck = await fetch(
                `https://duckduckgo.com/ac/?q=${encodeURIComponent(searchbar.value)}`
            );
            if (!autoCompleteCheck.ok) return;
            const autocomplete = await autoCompleteCheck.json();
            removeChildren(suggestionsEl);
            for (let index = 0; index < autocomplete.length; index++) {
                const suggestionText = autocomplete[index].phrase;
                // insert suggestion
                let suggestion = document.createElement('button');
                let suggestionHash = generateHashkey();
                suggestion.innerText = suggestionText;
                suggestion.classList.add('suggestion');
                suggestion.id = 'suggestion-' + suggestionHash;
                suggestion.addEventListener('click', () => {
                    loadURL(suggestionText);
                    removeChildren(suggestionsEl);
                });
                suggestionsEl.appendChild(suggestion);
            }
        } else {
            removeChildren(suggestionsEl);
        }} else {
        return;
    }
});

function loadURL(url, scheck='true') {
    view = document.querySelector('.current');
    if (isSearch(url)) {
        document.querySelector(
            '.current'
        ).src = `${engineurls[preferences.searchengine]}${encodeURIComponent(url)}`;
    } else {
        if ( url.startsWith('http://') ) {
            alert(`Page ${url} is not secure.`);
        }
        if (url.startsWith('https://raw.githubusercontent.com/CatalystDevOrg/Themes/master/') && url.endsWith('.css')) {
            if (confirm('This link looks like a theme URL. Attempt to install theme?')) {
                native.downloadTheme(url, url.split('/')[6]);
                if (confirm(`Theme ${url.split('/')[6]} installed successfully! Switch to theme?`)) {
                    native.loadTheme(url.split('/')[6]);
                }
            }
        }
        if (url.startsWith('catalyst://')) {
            keyword = url.split('catalyst://')[1];
            if (keyword == 'home') {
                // loadURL(ctlyststrppg)
                alert('not supported.');
            } else if (keyword == 'preferences') {
                togglePreferences();
            }
            return;
        }
        view.src = url;
    }
    removeChildren(suggestionsEl);
    view.addEventListener('did-finish-load', () => {
        if (preferences.dm) {
            if (localStorage.getItem('forced-dm-excludes') == null) {
                invertTab();
            } else if (localStorage.getItem('forced-dm-excludes').indexOf(view.url)) {
                return;
            } else {
                invertTab();
            }
        }
    });
}

function shouldAutocomplete(input) {
    for (let index = 0; index < protocols.length; index++) {
        const protocol = protocols[index];
        if (input.startsWith(`${protocol}://`)) {
            return false;
        }
    }
    return true;
}

function engineSupportsAC(input) {
    if (preferences.searchengine != 1) {
        return false;
    }
    return true;
}

function isSearch(input) {
    for (let index = 0; index < protocols.length; index++) {
        const protocol = protocols[index];
        if (input.startsWith(`${protocol}://`)) {
            return false;
        }
    }
    return true;
}

// add listeners
searchbar.addEventListener('keydown', (e) => {
    var url = document.getElementById('searchbar').value;
    if (e.code === 'Enter') loadURL(url);
});