var catalyst = JSON.stringify({
    'tabs': {
        current: document.getElementsByClassName('active-tab'),
    },
    'native': native,
    'extend': {
        isCatalyst: true,
        backgrounds: native.getBackgrounds(),
    }
});