const keys = {
    a: { pressed: false },
    d: { pressed: false },
    w: { pressed: false },
    ' ': { pressed: false }
};

window.addEventListener('keydown', (event) => {
    if (keys[event.key]) {
        keys[event.key].pressed = true;
    }
    if (event.key === ' ' && typeof window.player1 !== 'undefined' && window.getCurrentScene && window.getCurrentScene() === 'fight' && !window.matchResult) {
        window.player1.attack();
    }
    if (event.key === 'e' && typeof window.player1 !== 'undefined' && window.getCurrentScene && window.getCurrentScene() === 'fight' && !window.matchResult) {
        window.player1.specialMove();
    }
});

window.addEventListener('keyup', (event) => {
    if (keys[event.key]) {
        keys[event.key].pressed = false;
    }
});
