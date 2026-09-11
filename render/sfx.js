// === Sound Assets ===
const sounds = {
    hit: new Audio("assets/hit.mp3"),
    whiff: new Audio("assets/whiff.mp3"),
    jump: new Audio("assets/jump.mp3"),
    knockdown: new Audio("assets/knockdown.mp3"),
    roundStart: new Audio("assets/round-start.mp3"),
    win: new Audio("assets/win.mp3")
};

const bgMusic = new Audio("assets/bg2_music.wav");
bgMusic.loop = true;
bgMusic.volume = 0.4;
window.bgMusic = bgMusic;

// === Core Sound Playback ===
function playSound(sound) {
    if (!sound) return;
    // Clone to allow overlapping playback
    const clone = sound.cloneNode();
    clone.volume = sound.volume || 1;
    clone.play().catch(() => { });
}

// === Per-Character State Tracking ===
let prevState1 = "";
let prevState2 = "";
let prevOnGround1 = true;
let prevOnGround2 = true;

function checkCharacterSFX(character, player) {
    const prevState = player === 1 ? prevState1 : prevState2;
    const prevOnGround = player === 1 ? prevOnGround1 : prevOnGround2;

    const floorY = (window.getFloorY && window.canvas) ? window.getFloorY(window.canvas) : 600;
    const onGround = character.y + character.height >= floorY - 5;

    // Whiff sound: when entering an attack state
    if (character.state !== prevState) {
        if (character.state.startsWith("punch") || character.state === "kick" || character.state === "special") {
            playSound(sounds.whiff);
        }
    }

    // Jump sound: when leaving the ground
    if (!onGround && prevOnGround && character.velocityY < 0) {
        playSound(sounds.jump);
    }

    // Update tracking
    if (player === 1) {
        prevState1 = character.state;
        prevOnGround1 = onGround;
    } else {
        prevState2 = character.state;
        prevOnGround2 = onGround;
    }
}

export function updateSFX(character1, character2) {
    checkCharacterSFX(character1, 1);
    checkCharacterSFX(character2, 2);
}

// === Direct SFX Triggers ===
export function playRoundStart() {
    playSound(sounds.roundStart);
}
export function playWin() {
    playSound(sounds.win);
}
export function playHitSFX() {
    playSound(sounds.hit);
}
export function playKnockdownSFX() {
    playSound(sounds.knockdown);
}

// Make available to non-module scripts (matchLogic.js)
window.playHitSFX = function () { playSound(sounds.hit); };
window.playKnockdownSFX = function () { playSound(sounds.knockdown); };
window.playWinSFX = function () { playSound(sounds.win); };

// === Background Music ===
export function startBgMusic() {
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => { });
}
export function stopBgMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
}
export function pauseBgMusic() {
    bgMusic.pause();
}
export function resumeBgMusic() {
    bgMusic.play().catch(() => { });
}
export function toggleBgMusic() {
    bgMusic.muted = !bgMusic.muted;
    return !bgMusic.muted;
}
export function isBgMusicOn() {
    return !bgMusic.muted;
}
export function playMenuMove() {
}
export function playMenuSelect() {
}