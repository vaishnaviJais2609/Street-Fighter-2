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
    if (event.key === ' ' && typeof player1 !== 'undefined') {
        player1.attack();
    }
    if (event.key === 'e' && typeof player1 !== 'undefined') {
        player1.specialMove();
    }
});

window.addEventListener('keyup', (event) => {
    if (keys[event.key]) {
        keys[event.key].pressed = false;
    }
});
