const sounds = {
    hit: new Audio("assets/hit.mp3"),
    whiff: new Audio("assets/whiff.mp3"),
    jump: new Audio("assets/jump.mp3"),
    knockdown: new Audio("assets/knockdown.mp3"),
    roundStart: new Audio("assets/round-start.mp3"),
    win: new Audio("assets/win.mp3")
};

let previousState1 = "";
let previousState2 = "";

function playSound(sound) {
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function checkCharacterSFX(character, player) {
    const previousState = player === 1 ? previousState1 : previousState2;

    if (character && character.state !== previousState) {
        if (character.state === "hit") {
            playSound(sounds.hit);
        } else if (character.state === "whiff") {
            playSound(sounds.whiff);
        } else if (character.state === "jump") {
            playSound(sounds.jump);
        } else if (character.state === "knockdown") {
            playSound(sounds.knockdown);
        }

        if (player === 1) {
            previousState1 = character.state;
        } else {
            previousState2 = character.state;
        }
    }
}

export function updateSFX(character1, character2) {
    checkCharacterSFX(character1, 1);
    checkCharacterSFX(character2, 2);
}

export function playRoundStart() {
    playSound(sounds.roundStart);
}

export function playWin() {
    playSound(sounds.win);
}

export function playMenuMove() {
    playSound(sounds.whiff);
}

export function playMenuSelect() {
    playSound(sounds.hit);
}