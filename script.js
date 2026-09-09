import { drawUI, drawMainMenu, drawBackgroundSelect, drawCharacterSelect, getMenuButtonBounds, getStageSelectCardBounds, getCharacterSelectCardBounds, CHARACTERS, getSelectedCharacterIndex, setSelectedCharacterIndex } from "./render/ui.js";
import { drawBackground, STAGES, getCurrentStageIndex, setStageIndex } from "./render/stage.js";
import { getCurrentScene, goTo, MENU_ITEMS, getSelectedIndex, setSelectedIndex, moveSelection } from "./render/menu.js";
import { updateSFX, playRoundStart, playWin } from "./render/sfx.js";
window.getCurrentScene = getCurrentScene;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
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
            this.frameTimer++;
            if (this.frameTimer > FRAME_DELAY) {
                if (this.state === 'punch' || this.state === 'kick' || this.state === 'special') {
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
        this.state = 'punch'; 
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
        if (this.y + this.height + this.velocityY >= canvas.height) {
            this.velocityY = 0;
            this.y = canvas.height - this.height;
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
let result = null;
let testTimer = 99;
let hoveredMenuIndex = -1;
let hoveredStageIndex = -1;
let hoveredCharIndex = -1;
function gameLoop() {
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
                if (keys.a.pressed) {
                    character1.velocityX = -character1.speed;
                    character1.facing = -1;
                } else if (keys.d.pressed) {
                    character1.velocityX = character1.speed;
                    character1.facing = 1;
                }
                if (keys.w.pressed && character1.y + character1.height >= canvas.height) {
                    character1.velocityY = -15;
                }
            }
            if (typeof updateAI === 'function') {
                updateAI(character1, character2);
                if (character1.x < character2.x) {
                    character2.facing = -1;
                } else {
                    character2.facing = 1;
                }
            }
        }
        character1.update();
        character2.update();
        for (let i = window.projectiles.length - 1; i >= 0; i--) {
            const projectile = window.projectiles[i];
            projectile.update();
            if (projectile.markedForDeletion) {
                window.projectiles.splice(i, 1);
            }
        }
        if (typeof checkHits === 'function') {
            checkHits(character1, character2);
        }
        if (typeof determineWinner === 'function') {
            determineWinner(character1, character2);
        }
        updateSFX(character1, character2);
        let currentTimer = typeof timer !== 'undefined' ? timer : 99;
        drawUI(ctx, canvas, character1, character2, currentTimer, player1Wins, player2Wins, window.matchResult || result);
    } else if (scene === "results") {
        drawResults();
    }
    requestAnimationFrame(gameLoop);
}
function resetFight() {
    character1.health = 100;
    character2.health = 100;
    character1.x = 200;
    character1.y = canvas.height - character1.height;
    character1.velocityY = 0;
    character1.isAttacking = false;
    character1.state = 'idle';
    character2.x = canvas.width - 250;
    character2.y = canvas.height - character2.height;
    character2.velocityY = 0;
    character2.isAttacking = false;
    character2.state = 'idle';
    character2.aiDecisionTimer = 0;
    if (window.projectiles) window.projectiles.length = 0;
    result = null;
    window.matchResult = null;
    if (typeof timer !== 'undefined') window.timer = 60; // Just in case
    playRoundStart();
    goTo("fight");
}
function executeMenuOption(index) {
    const item = MENU_ITEMS[index];
    if (item.id === "start") {
        resetFight();
    } else if (item.id === "character-select") {
        goTo("character-select");
    } else if (item.id === "background-select") {
        goTo("background-select");
    }
}
function drawResults() {
    ctx.fillStyle = "#0c1024";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = "#FFDE00";
    ctx.shadowColor = "#FF3300";
    ctx.shadowBlur = 20;
    ctx.textAlign = "center";
    ctx.font = "bold 36px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText(result || "K.O. - RESULTS", canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "14px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText("PRESS ENTER TO REMATCH", canvas.width / 2, canvas.height / 2 + 50);
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
            resetFight();
        } else if (event.key === "Escape") {
            goTo("menu");
        }
    } else if (scene === "fight") {
        if (event.key === "Escape") {
            goTo("menu");
        }
    } else if (scene === "results") {
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