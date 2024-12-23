
// initialise global variables
const bookmarksBar = document.getElementById('bookmarks');
// get bookmarks initialised
if (window.localStorage.getItem('bookmarks') == null) {
    window.localStorage.setItem('bookmarks', JSON.stringify([]));
}
let bookmarks = JSON.parse(window.localStorage.getItem('bookmarks'));
updateBookmarksVar();
// functions

/**
 * Adds a bookmark to the bookmarks bar
 * @param {string} url The URL to add a bookmark for.
 * @param {string} title The title of the page.
 */
function addBookmarkToBar(url, title, icon) {
    let bookmarkEl = document.createElement('div');
    bookmarkEl.innerHTML = `<img src='${icon}'<h1>${title}</h1>`;
    bookmarkEl.onclick = () => {
        createTab(url);
    };
    bookmarkEl.classList.add('bookmark');
    bookmarksBar.appendChild(bookmarkEl);
}

/**
 * Bookmarks the current tab
 */
function bookmarkCurrentTab() {
    updateBookmarksVar();
    const toPush = {
        title: document.querySelector('.current').getTitle(),
        url: document.querySelector('.current').getURL(),
        icon: document.querySelector('.active-tab').getElementsByTagName('img')[0].src
    };
    if (bookmarks.some((key) => key.url === toPush.url)) {
        if (confirm('Would you like to un-bookmark this page?')) {
            for (let index in bookmarks) {
                if (bookmarks[index].url == toPush.url) {
                    bookmarks.splice(index, 1);
                    break;
                }
            }
            storeBookmarks();
        }
        return;
    }
    bookmarks.push(toPush);
    storeBookmarks();
}

function progBookmarkTab(u, t, i) {
    updateBookmarksVar();
    const toPush = {
        title: t,
        url: u,
        icon: i
    };
    bookmarks.push(toPush);
    storeBookmarks();
}

/**
 * Updates the bookmarks variable and displays the bookmarks
 */
function updateBookmarksVar() {
    bookmarks = JSON.parse(window.localStorage.getItem('bookmarks'));
    removeChildren(bookmarksBar);
    if (bookmarks.length === 0) bookmarksBar.classList.add('hidden');
    for (let bookmarkIdx in bookmarks) {
        const bookmark = bookmarks[bookmarkIdx];
        addBookmarkToBar(bookmark.url, bookmark.title, bookmark.icon);
    }
}

/**
 * Stores the bookmarks in localstorage and runs updateBookmarksVar
 */
function storeBookmarks() {
    if (bookmarks.length === 0) bookmarksBar.classList.add('hidden');
    else bookmarksBar.classList.remove('hidden');
    window.localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    updateBookmarksVar();
}