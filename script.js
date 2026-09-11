import { drawUI, drawMainMenu, drawBackgroundSelect, drawCharacterSelect, drawInstructions, getMenuButtonBounds, getStageSelectCardBounds, getCharacterSelectCardBounds, CHARACTERS, getSelectedCharacterIndex, setSelectedCharacterIndex } from "./render/ui.js";
import { drawBackground, STAGES, getCurrentStageIndex, setStageIndex, getFloorY, drawRoundBanner } from "./render/stage.js";
import { getCurrentScene, goTo, MENU_ITEMS, getSelectedIndex, setSelectedIndex, moveSelection } from "./render/menu.js";
import { updateSFX, playRoundStart, playWin, playHitSFX, playKnockdownSFX, startBgMusic, stopBgMusic, pauseBgMusic, resumeBgMusic, toggleBgMusic, isBgMusicOn } from "./render/sfx.js";
window.getCurrentScene = getCurrentScene;
window.getFloorY = getFloorY;
const canvas = document.getElementById("gameCanvas");
window.canvas = canvas;
const ctx = canvas.getContext("2d");
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const p1WinImg = new Image();
p1WinImg.src = "assets/WhatsApp Image 2026-09-10 at 2.37.40 PM.jpeg";
const p2WinImg = new Image();
p2WinImg.src = "assets/WhatsApp Image 2026-09-10 at 2.37.12 PM.jpeg";

const gravity = 0.7;
const FRAME_DELAY = 5;
class Projectile {
    constructor({ x, y, velocity, image, animations, facing, owner }) {
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.image = image;
        this.extraImages = {};
        this.animations = animations;
        this.facing = facing;
        this.owner = owner;
        this.state = 'fireball';
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.markedForDeletion = false;
        this.width = 50;
        this.height = 50;
    }
    draw() {
        if (!this.image || !this.animations[this.state]) return;
        const frames = this.animations[this.state];
        const frameData = frames[this.frameIndex % frames.length];
        const rect = frameData.rect;
        const currentImage = frameData.sheet ? this.extraImages[frameData.sheet] : this.image;
        if (!currentImage) return;
        const scale = 2;
        const destWidth = rect.w * scale;
        const destHeight = rect.h * scale;
        const offset = frameData.offset || { x: 0, y: 0 };
        ctx.save();
        if (this.facing === -1) {
            ctx.translate(this.x + destWidth + (offset.x * scale * this.facing), this.y + (offset.y * scale));
            ctx.scale(-1, 1);
            ctx.drawImage(
                currentImage,
                rect.x, rect.y, rect.w, rect.h,
                0, 0, destWidth, destHeight
            );
        } else {
            ctx.drawImage(
                currentImage,
                rect.x, rect.y, rect.w, rect.h,
                this.x + (offset.x * scale * this.facing), this.y + (offset.y * scale), destWidth, destHeight
            );
        }
        ctx.restore();
        this.frameTimer++;
        if (this.frameTimer > FRAME_DELAY) {
            if (this.state === 'fireball_impact') {
                if (this.frameIndex < frames.length - 1) {
                    this.frameIndex++;
                } else {
                    this.markedForDeletion = true;
                }
            } else {
                this.frameIndex = (this.frameIndex + 1) % frames.length;
            }
            this.frameTimer = 0;
        }
    }
    update() {
        if (!this.animations[this.state]) {
            this.markedForDeletion = true;
            return;
        }
        this.draw();
        if (this.state !== 'fireball_impact') {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
        }
        if (this.x > canvas.width || this.x + this.width < 0) {
            this.markedForDeletion = true;
        }
    }
}
class Fighter {
    constructor(x, y, color, facing, imageSrc, atlasSrc) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 150;
        this.color = color;
        this.facing = facing;
        this.velocityY = 0;
        this.velocityX = 0;
        this.speed = 5;
        this.state = 'idle';
        this.health = 100;
        this.isAttacking = false;
        this.hasHit = false;
        this.attackBox = {
            x: this.x,
            y: this.y,
            width: 100,
            height: 50
        };
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.imageSrc = imageSrc;
        this.atlasSrc = atlasSrc;
        this.image = null;
        this.extraImages = {};
        this.animations = {};
        this.aiDecisionTimer = 0;
    }
    async loadAssets() {
        if (!this.imageSrc || !this.atlasSrc) return;
        this.image = new Image();
        this.image.src = this.imageSrc + '?v=' + Date.now();
        try {
            const response = await fetch(this.atlasSrc + '?v=' + Date.now());
            if (response.ok) {
                const atlas = await response.json();
                this.animations = buildAnimations(atlas);
                const sheetsToLoad = new Set();
                for (const anim in this.animations) {
                    for (const frame of this.animations[anim]) {
                        if (frame.sheet) sheetsToLoad.add(frame.sheet);
                    }
                }
                for (const sheet of sheetsToLoad) {
                    const img = new Image();
                    img.src = 'assets/' + sheet + '?v=' + Date.now();
                    this.extraImages[sheet] = img;
                }
                this.animations['walk'] = this.animations['idle'];
            } else {
                console.warn(`Could not load ${this.atlasSrc}`);
            }
        } catch (e) {
            console.warn('Error loading assets:', e);
        }
    }
    draw() {
        if (!this.image || Object.keys(this.animations).length === 0) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            if (this.isAttacking) {
                ctx.fillStyle = 'green';
                ctx.fillRect(this.attackBox.x, this.attackBox.y, this.attackBox.width, this.attackBox.height);
            }
            return;
        }
        let animState = this.state;
        if (!this.animations[animState]) {
            animState = 'idle';
        }
        const frames = this.animations[animState];
        if (frames && frames.length > 0) {
            const frameData = frames[this.frameIndex % frames.length];
            const rect = frameData.rect;
            const currentImage = frameData.sheet ? this.extraImages[frameData.sheet] : this.image;
            if (!currentImage) return;
            const scale = 2;
            const destWidth = rect.w * scale;
            const destHeight = rect.h * scale;
            const offset = frameData.offset || { x: 0, y: 0 };
            const destX = this.x + (this.width / 2) - (destWidth / 2) + (offset.x * scale * this.facing);
            const destY = this.y + this.height - destHeight + (offset.y * scale);
            ctx.save();
            if (this.facing === -1) {
                ctx.translate(destX + destWidth, destY);
                ctx.scale(-1, 1);
                ctx.drawImage(
                    currentImage,
                    rect.x, rect.y, rect.w, rect.h,
                    0, 0, destWidth, destHeight
                );
            } else {
                ctx.drawImage(
                    currentImage,
                    rect.x, rect.y, rect.w, rect.h,
                    destX, destY, destWidth, destHeight
                );
            }
            ctx.restore();
            if (!window.roundStarting) {
                this.frameTimer++;
            }
            if (this.frameTimer > FRAME_DELAY) {
                if (this.state.startsWith('punch') || this.state === 'kick' || this.state === 'special') {
                    if (this.frameIndex < frames.length - 1) {
                        this.frameIndex++;
                    } else {
                        if (this.state === 'special') {
                            window.projectiles.push(new Projectile({
                                x: this.facing === 1 ? this.x + this.width : this.x - 50,
                                y: this.y + 20,
                                velocity: { x: this.facing === 1 ? 10 : -10, y: 0 },
                                image: this.image,
                                animations: this.animations,
                                facing: this.facing,
                                owner: this
                            }));
                            window.projectiles[window.projectiles.length - 1].extraImages = this.extraImages;
                        }
                        this.isAttacking = false;
                        this.state = 'idle';
                    }
                } else {
                    if (window.matchResult && this.frameIndex === frames.length - 1) {
                    } else {
                        this.frameIndex = (this.frameIndex + 1) % frames.length;
                    }
                }
                this.frameTimer = 0;
            }
        }
    }
    attack() {
        if (this.isAttacking) return;
        this.isAttacking = true;
        this.hasHit = false;

        if (this === window.player2 && !window.isMultiplayer) {
            const punches = ['punch', 'punch2', 'punch3'];
            this.state = punches[Math.floor(Math.random() * punches.length)];
        } else {
            this.state = 'punch';
        }
    }
    attackNew() {
        if (this.isAttacking) return;
        this.isAttacking = true;
        this.frameIndex = 0;
        this.frameTimer = 0;
        const newPunches = ['punch2', 'punch3'];
        this.state = newPunches[Math.floor(Math.random() * newPunches.length)];
    }
    kick() {
        if (this.isAttacking && this.state !== 'punch') return;
        this.isAttacking = true;
        this.hasHit = false;
        this.state = 'kick';
        this.frameIndex = 0;
        this.frameTimer = 0;
    }
    specialMove() {
        if (this.isAttacking) return;
        if (window.projectiles) {
            for (let i = 0; i < window.projectiles.length; i++) {
                if (window.projectiles[i].owner === this) {
                    return;
                }
            }
        }
        this.isAttacking = true;
        this.hasHit = false;
        this.state = 'special';
        this.frameIndex = 0;
        this.frameTimer = 0;
    }
    update() {
        if (this.facing === 1) {
            this.attackBox.x = this.x;
        } else {
            this.attackBox.x = this.x - this.attackBox.width + this.width;
        }
        this.attackBox.y = this.y + 20;
        if (typeof updateState === 'function') {
            updateState(this);
        }
        this.draw();
        this.x += this.velocityX;
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
        this.y += this.velocityY;
        const floorY = getFloorY(canvas);
        if (this.y + this.height + this.velocityY >= floorY) {
            this.velocityY = 0;
            this.y = floorY - this.height;
        } else {
            this.velocityY += gravity;
        }
    }
}
window.projectiles = [];
const character1 = new Fighter(200, 0, 'red', 1, 'assets/character-sprites.png', 'character-atlas.json');
const character2 = new Fighter(canvas.width - 250, 0, 'blue', -1, 'assets/player2-sprites.png', 'character2-atlas.json');
window.player1 = character1;
window.player2 = character2;
let player1Wins = 0;
let player2Wins = 0;
window.currentRound = 1;
window.roundEnding = false;
window.roundStarting = false;
let result = null;
let testTimer = 99;
let isMultiplayer = false;
window.isMultiplayer = isMultiplayer;

function setMultiplayer(value) {
    isMultiplayer = value;
    window.isMultiplayer = value;
}
let hoveredMenuIndex = -1;
let hoveredStageIndex = -1;
let hoveredCharIndex = -1;
let isPaused = false;
window.isPaused = false;

const pauseBtn = document.getElementById('pauseBtn');
const pauseOverlay = document.getElementById('pauseOverlay');
const pmResume = document.getElementById('pmResume');
const pmMusic = document.getElementById('pmMusic');
const pmRestart = document.getElementById('pmRestart');
const pmQuit = document.getElementById('pmQuit');

function openPause() {
    isPaused = true;
    window.isPaused = true;
    pauseOverlay.classList.add('active');
}
function closePause() {
    isPaused = false;
    window.isPaused = false;
    pauseOverlay.classList.remove('active');
}

pauseBtn.addEventListener('click', () => { isPaused ? closePause() : openPause(); });
pmResume.addEventListener('click', closePause);
pmMusic.addEventListener('click', () => {
    const on = toggleBgMusic();
    pmMusic.textContent = (on ? '\u266B MUSIC: ON' : '\u266B MUSIC: OFF');
});
pmRestart.addEventListener('click', () => {
    closePause();
    resetFight(true);
});
pmQuit.addEventListener('click', () => {
    closePause();
    stopBgMusic();
    goTo('menu');
});

function gameLoop() {
    if (isPaused) { requestAnimationFrame(gameLoop); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scene = getCurrentScene();
    if (scene === "menu") {
        drawMainMenu(ctx, canvas, getSelectedIndex(), hoveredMenuIndex);
    } else if (scene === "background-select") {
        drawBackgroundSelect(ctx, canvas, getCurrentStageIndex(), hoveredStageIndex);
    } else if (scene === "character-select") {
        drawCharacterSelect(ctx, canvas, getSelectedCharacterIndex(), hoveredCharIndex);
    } else if (scene === "fight") {
        drawBackground(ctx, canvas);
        character1.velocityX = 0;
        if (!window.matchResult) {
            if (typeof keys !== 'undefined') {
                if (window.isMultiplayer) {


                    let p1MovingLeft = keys.a.pressed;
                    let p1MovingRight = keys.d.pressed;
                    character1.isCrouching = keys.s.pressed;

                    if (character1.isCrouching) {
                        character1.velocityX = 0;
                    } else if (p1MovingLeft) {
                        character1.velocityX = -character1.speed;
                        character1.facing = -1;
                    } else if (p1MovingRight) {
                        character1.velocityX = character1.speed;
                        character1.facing = 1;
                    }

                    if (!character1.isCrouching && keys.w.pressed && character1.y + character1.height >= getFloorY(canvas)) {
                        character1.velocityY = -15;
                    }


                    let p2MovingLeft = keys.ArrowLeft.pressed;
                    let p2MovingRight = keys.ArrowRight.pressed;
                    character2.isCrouching = false;

                    if (p2MovingLeft) {
                        character2.velocityX = -character2.speed;
                        character2.facing = -1;
                    } else if (p2MovingRight) {
                        character2.velocityX = character2.speed;
                        character2.facing = 1;
                    } else {
                        character2.velocityX = 0;
                    }

                    if (!character2.isCrouching && keys.ArrowUp.pressed && character2.y + character2.height >= getFloorY(canvas)) {
                        character2.velocityY = -15;
                    }
                } else {

                    let movingLeft = keys.a.pressed || keys.ArrowLeft.pressed;
                    let movingRight = keys.d.pressed || keys.ArrowRight.pressed;

                    character1.isCrouching = keys.s.pressed || keys.ArrowDown.pressed;

                    if (character1.isCrouching) {
                        character1.velocityX = 0;
                    } else if (movingLeft) {
                        character1.velocityX = -character1.speed;
                        character1.facing = -1;
                    } else if (movingRight) {
                        character1.velocityX = character1.speed;
                        character1.facing = 1;
                    }

                    if (!character1.isCrouching && (keys.w.pressed || keys.ArrowUp.pressed) && character1.y + character1.height >= getFloorY(canvas)) {
                        character1.velocityY = -15;
                    }
                }
            }
            if (!window.isMultiplayer && typeof updateAI === 'function') {
                updateAI(character1, character2);
                if (character1.x < character2.x) {
                    character2.facing = -1;
                } else {
                    character2.facing = 1;
                }
            } else if (window.isMultiplayer) {

                if (character1.x < character2.x) {
                    character1.facing = 1;
                    character2.facing = -1;
                } else {
                    character1.facing = -1;
                    character2.facing = 1;
                }
            }
        }
        if (!window.roundEnding && !window.roundStarting) {
            character1.update();
            character2.update();
        } else if (window.roundStarting) {
            character1.draw();
            character2.draw();
        }

        if (typeof checkBodyCollision === 'function' && !window.roundStarting) {
            checkBodyCollision(character1, character2, canvas.width);
        }
        for (let i = window.projectiles.length - 1; i >= 0; i--) {
            const projectile = window.projectiles[i];
            if (!window.roundStarting) projectile.update();
            else projectile.draw();
            if (projectile.markedForDeletion) {
                window.projectiles.splice(i, 1);
            }
        }
        if (typeof checkHits === 'function' && !window.roundStarting) {
            checkHits(character1, character2);
        }
        if (typeof determineWinner === 'function' && !window.roundEnding && !window.roundStarting) {
            determineWinner(character1, character2);
        }

        if (window.matchResult && !window.roundEnding) {
            window.roundEnding = true;

            setTimeout(() => {
                if (window.matchResult === 'Player 1 Wins') {
                    player1Wins++;
                } else if (window.matchResult === 'Player 2 Wins') {
                    player2Wins++;
                }

                if (player1Wins >= 2 || player2Wins >= 2) {

                    if (player1Wins >= 2) {
                        result = "PLAYER 1 WINS THE MATCH";
                    } else {
                        result = "PLAYER 2 WINS THE MATCH";
                    }
                    goTo("results");
                } else {

                    window.currentRound++;
                    resetFight(false);
                }
            }, 2000);
        }
        updateSFX(character1, character2);
        let currentTimer = typeof timer !== 'undefined' ? timer : 99;
        drawUI(ctx, canvas, character1, character2, currentTimer, player1Wins, player2Wins, window.matchResult || result);

        if (window.roundStarting) {
            drawRoundBanner(ctx, canvas, window.currentRound);
        }
    } else if (scene === "results") {
        drawResults();
    } else if (scene === "instructions") {
        drawInstructions(ctx, canvas);
    }
    pauseBtn.style.display = (scene === 'fight') ? 'block' : 'none';
    requestAnimationFrame(gameLoop);
}
function resetFight(hardReset = true) {
    if (hardReset) {
        player1Wins = 0;
        player2Wins = 0;
        window.currentRound = 1;
    }

    character1.health = 100;
    character2.health = 100;
    character1.x = 200;
    character1.y = getFloorY(canvas) - character1.height;
    character1.velocityY = 0;
    character1.isAttacking = false;
    character1.state = 'idle';
    character2.x = canvas.width - 250;
    character2.y = getFloorY(canvas) - character2.height;
    character2.velocityY = 0;
    character2.isAttacking = false;
    character2.state = 'idle';
    character2.aiDecisionTimer = 0;
    if (window.projectiles) window.projectiles.length = 0;
    result = null;
    window.matchResult = null;
    window.roundEnding = false;
    window.roundStarting = true;

    setTimeout(() => {
        window.roundStarting = false;
        if (typeof decreaseTimer === 'function') decreaseTimer(character1, character2);
    }, 1200);

    if (typeof window.resetMatchTimer === 'function') {
        window.resetMatchTimer();
    }

    playRoundStart();
    startBgMusic();
    goTo("fight");
}
function executeMenuOption(index) {
    const item = MENU_ITEMS[index];
    if (item.id === "start") {
        setMultiplayer(false);
        resetFight();
    } else if (item.id === "multiplayer") {
        setMultiplayer(true);
        resetFight();
    } else if (item.id === "character-select") {
        goTo("character-select");
    } else if (item.id === "background-select") {
        goTo("background-select");
    }
    else if (item.id === "instructions") {
        goTo("instructions");
    }
}
function drawResults() {
    drawBackground(ctx, canvas);
    let currentTimer = typeof timer !== 'undefined' ? timer : 99;
    drawUI(ctx, canvas, character1, character2, currentTimer, player1Wins, player2Wins, null);

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    let winImg = null;
    if (result === "PLAYER 1 WINS THE MATCH") winImg = p1WinImg;
    else if (result === "PLAYER 2 WINS THE MATCH") winImg = p2WinImg;

    if (winImg && winImg.complete && winImg.naturalWidth > 0) {
        let imgWidth = 260;
        let imgHeight = (winImg.height / winImg.width) * imgWidth;
        let imgY = canvas.height / 2 - imgHeight - 60;
        if (imgY < 30) {
            imgY = 30;
            imgHeight = (canvas.height / 2 - 60) - 30;
            imgWidth = (winImg.width / winImg.height) * imgHeight;
        }
        ctx.shadowBlur = 0;
        ctx.drawImage(winImg, canvas.width / 2 - imgWidth / 2, imgY, imgWidth, imgHeight);
    }

    let textY = canvas.height / 2 + 20;
    ctx.fillStyle = "#FFDE00";
    ctx.shadowColor = "#FF3300";
    ctx.shadowBlur = 20;
    ctx.textAlign = "center";
    ctx.font = "bold 36px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText(result || "K.O. - RESULTS", canvas.width / 2, textY);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "14px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText("PRESS ENTER TO REMATCH", canvas.width / 2, textY + 60);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "10px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText("PRESS ESC FOR MAIN MENU", canvas.width / 2, canvas.height - 30);
    ctx.restore();
}
window.addEventListener("keydown", function (event) {
    const scene = getCurrentScene();
    if (scene === "menu") {
        if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
            moveSelection(-1);
        } else if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
            moveSelection(1);
        } else if (event.key === "Enter" || event.key === " ") {
            executeMenuOption(getSelectedIndex());
        }
    } else if (scene === "background-select") {
        if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
            setStageIndex((getCurrentStageIndex() - 1 + STAGES.length) % STAGES.length);
        } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
            setStageIndex((getCurrentStageIndex() + 1) % STAGES.length);
        } else if (event.key === "Enter" || event.key === " ") {
            goTo("menu");
        } else if (event.key === "Escape") {
            goTo("menu");
        }
    } else if (scene === "character-select") {
        if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
            const nextIdx = (getSelectedCharacterIndex() - 1 + CHARACTERS.length) % CHARACTERS.length;
            setSelectedCharacterIndex(nextIdx);
        } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
            const nextIdx = (getSelectedCharacterIndex() + 1) % CHARACTERS.length;
            setSelectedCharacterIndex(nextIdx);
        } else if (event.key === "Enter" || event.key === " ") {
            setMultiplayer(false);
            resetFight();
        } else if (event.key === "Escape") {
            goTo("menu");
        }
    } else if (scene === "fight") {
        if (event.key === "p" || event.key === "P" || event.key === "Escape") {
            isPaused ? closePause() : openPause();
        }
    } else if (scene === "instructions") {
        if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
            goTo("menu");
        }
    }
    else if (scene === "results") {
        if (event.key === "Enter" || event.key === " ") {
            resetFight();
        } else if (event.key === "Escape") {
            goTo("menu");
        }
    }
});
function getCanvasMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}
canvas.addEventListener("mousemove", function (e) {
    const scene = getCurrentScene();
    const pos = getCanvasMousePos(e);
    if (scene === "menu") {
        const buttons = getMenuButtonBounds(canvas);
        let foundIndex = -1;
        for (const btn of buttons) {
            if (pos.x >= btn.x && pos.x <= btn.x + btn.width &&
                pos.y >= btn.y && pos.y <= btn.y + btn.height) {
                foundIndex = btn.index;
                break;
            }
        }
        hoveredMenuIndex = foundIndex;
        if (foundIndex !== -1) {
            canvas.style.cursor = "pointer";
            if (foundIndex !== getSelectedIndex()) {
                setSelectedIndex(foundIndex);
            }
        } else {
            canvas.style.cursor = "default";
        }
    } else if (scene === "background-select") {
        const cards = getStageSelectCardBounds(canvas);
        let foundIndex = -1;
        for (const card of cards) {
            if (pos.x >= card.x && pos.x <= card.x + card.width &&
                pos.y >= card.y && pos.y <= card.y + card.height) {
                foundIndex = card.index;
                break;
            }
        }
        hoveredStageIndex = foundIndex;
        if (foundIndex !== -1) {
            canvas.style.cursor = "pointer";
            if (foundIndex !== getCurrentStageIndex()) {
                setStageIndex(foundIndex);
            }
        } else {
            canvas.style.cursor = "default";
        }
    } else if (scene === "character-select") {
        const cards = getCharacterSelectCardBounds(canvas);
        let foundIndex = -1;
        for (const card of cards) {
            if (pos.x >= card.x && pos.x <= card.x + card.width &&
                pos.y >= card.y && pos.y <= card.y + card.height) {
                foundIndex = card.index;
                break;
            }
        }
        hoveredCharIndex = foundIndex;
        if (foundIndex !== -1) {
            canvas.style.cursor = "pointer";
            if (foundIndex !== getSelectedCharacterIndex()) {
                setSelectedCharacterIndex(foundIndex);
            }
        } else {
            canvas.style.cursor = "default";
        }
    } else {
        canvas.style.cursor = "default";
        hoveredMenuIndex = -1;
        hoveredStageIndex = -1;
        hoveredCharIndex = -1;
    }
});
canvas.addEventListener("mouseleave", function () {
    hoveredMenuIndex = -1;
    hoveredStageIndex = -1;
    hoveredCharIndex = -1;
    canvas.style.cursor = "default";
});
canvas.addEventListener("click", function (e) {
    const scene = getCurrentScene();
    const pos = getCanvasMousePos(e);
    if (scene === "menu") {
        const buttons = getMenuButtonBounds(canvas);
        for (const btn of buttons) {
            if (pos.x >= btn.x && pos.x <= btn.x + btn.width &&
                pos.y >= btn.y && pos.y <= btn.y + btn.height) {
                setSelectedIndex(btn.index);
                executeMenuOption(btn.index);
                break;
            }
        }
    } else if (scene === "background-select") {
        const cards = getStageSelectCardBounds(canvas);
        for (const card of cards) {
            if (pos.x >= card.x && pos.x <= card.x + card.width &&
                pos.y >= card.y && pos.y <= card.y + card.height) {
                setStageIndex(card.index);
                goTo("menu");
                break;
            }
        }
    } else if (scene === "character-select") {
        const cards = getCharacterSelectCardBounds(canvas);
        for (const card of cards) {
            if (pos.x >= card.x && pos.x <= card.x + card.width &&
                pos.y >= card.y && pos.y <= card.y + card.height) {
                setSelectedCharacterIndex(card.index);
                setMultiplayer(false);
                resetFight();
                break;
            }
        }
    }
});
function buildAnimations(atlas) {
    const anims = {};
    for (const frameName in atlas.frames) {
        const animName = frameName.replace(/_\d+$/, '');
        if (!anims[animName]) anims[animName] = [];
        anims[animName].push({
            rect: atlas.frames[frameName].frame,
            sheet: atlas.frames[frameName].sheet || null,
            offset: atlas.frames[frameName].offset || null
        });
    }
    return anims;
}
async function init() {
    await Promise.all([
        character1.loadAssets(),
        character2.loadAssets()
    ]);
    if (typeof decreaseTimer === 'function') {
        decreaseTimer(character1, character2);
    }
    gameLoop();
}
init();