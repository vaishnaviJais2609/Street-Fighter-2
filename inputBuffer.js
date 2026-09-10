const keys = {
    a: { pressed: false },
    d: { pressed: false },
    w: { pressed: false },
    ' ': { pressed: false },
    ArrowUp: { pressed: false },
    ArrowDown: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
    Home: { pressed: false },
    End: { pressed: false },
    Shift: { pressed: false }
};

let lastSpacePressTime = 0;

window.addEventListener('keydown', (event) => {
    if (keys[event.key]) {
        keys[event.key].pressed = true;
        // Prevent default browser behavior (scrolling/focus) for game keys
        if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
        }
    }
    if (event.key === ' ' && typeof window.player1 !== 'undefined' && window.getCurrentScene && window.getCurrentScene() === 'fight' && !window.matchResult) {
        const currentTime = Date.now();
        if (currentTime - lastSpacePressTime < 300) {
            window.player1.kick();
        } else {
            window.player1.attack();
        }
        lastSpacePressTime = currentTime;
    }
    if ((event.key === 'e' || event.key === 'Shift') && typeof window.player1 !== 'undefined' && window.getCurrentScene && window.getCurrentScene() === 'fight' && !window.matchResult) {
        window.player1.specialMove();
    }
});
window.addEventListener('keyup', (event) => {
    if (keys[event.key]) {
        keys[event.key].pressed = false;
    }
});