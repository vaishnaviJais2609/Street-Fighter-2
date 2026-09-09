import { drawUI } from "./render/ui.js";
import { drawBackground } from "./render/stage.js";

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
        this.animations = {};
    }

    async loadAssets() {
        if (!this.imageSrc || !this.atlasSrc) return;
        
        this.image = new Image();
        this.image.src = this.imageSrc;
        
        try {
            const response = await fetch(this.atlasSrc);
            if (response.ok) {
                const atlas = await response.json();
                this.animations = buildAnimations(atlas);
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
            const rect = frames[this.frameIndex % frames.length];
            
            const scale = 2;
            const destWidth = rect.w * scale;
            const destHeight = rect.h * scale;
            
            const destX = this.x + (this.width / 2) - (destWidth / 2);
            const destY = this.y + this.height - destHeight;
            
            ctx.save();
            if (this.facing === -1) {
                ctx.translate(destX + destWidth, destY);
                ctx.scale(-1, 1);
                ctx.drawImage(
                    this.image,
                    rect.x, rect.y, rect.w, rect.h,
                    0, 0, destWidth, destHeight
                );
            } else {
                ctx.drawImage(
                    this.image,
                    rect.x, rect.y, rect.w, rect.h,
                    destX, destY, destWidth, destHeight
                );
            }
            ctx.restore();

            this.frameTimer++;
            if (this.frameTimer > FRAME_DELAY) {
                if (this.state === 'punch' || this.state === 'kick') {
                    if (this.frameIndex < frames.length - 1) {
                        this.frameIndex++;
                    } else {
                        this.isAttacking = false;
                        this.state = 'idle';
                    }
                } else {
                    this.frameIndex = (this.frameIndex + 1) % frames.length;
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
        this.y += this.velocityY;

        if (this.y + this.height + this.velocityY >= canvas.height) {
            this.velocityY = 0;
            this.y = canvas.height - this.height;
        } else {
            this.velocityY += gravity;
        }
    }
}

const player1 = new Fighter(200, 0, 'red', 1, 'character-sprites.png', 'character-atlas.json');
const player2 = new Fighter(canvas.width - 250, 0, 'blue', -1, 'character-sprites.png', 'character-atlas.json');

window.player1 = player1;
window.player2 = player2;

let player1Wins = 0;
let player2Wins = 0;

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground(ctx, canvas);

    player1.velocityX = 0;
    if (typeof keys !== 'undefined') {
        if (keys.a.pressed) {
            player1.velocityX = -player1.speed;
            player1.facing = -1;
        } else if (keys.d.pressed) {
            player1.velocityX = player1.speed;
            player1.facing = 1;
        }

        if (keys.w.pressed && player1.y + player1.height >= canvas.height) {
            player1.velocityY = -15;
        }
    }

    if (typeof updateAI === 'function') {
        updateAI(player1, player2);
    
        if (player1.x < player2.x) {
            player2.facing = -1;
        } else {
            player2.facing = 1;
        }
    }

    player1.update();
    player2.update();

    if (typeof checkHits === 'function') {
        checkHits(player1, player2);
    }

    if (typeof determineWinner === 'function') {
        determineWinner(player1, player2);
    }

    let currentTimer = typeof timer !== 'undefined' ? timer : 60;
    
    drawUI(
        ctx,
        canvas,
        player1,
        player2,
        currentTimer,
        player1Wins,
        player2Wins,
        window.matchResult
    );

    requestAnimationFrame(gameLoop);
}

function buildAnimations(atlas) {
    const anims = {};
    for (const frameName in atlas.frames) {
        const animName = frameName.replace(/_\d+$/, '');
        if (!anims[animName]) anims[animName] = [];
        anims[animName].push(atlas.frames[frameName].frame);
    }
    return anims;
}

async function init() {
    await Promise.all([
        player1.loadAssets(),
        player2.loadAssets()
    ]);

    if (typeof decreaseTimer === 'function') {
        decreaseTimer(player1, player2);
    }
    
    gameLoop();
}

init();
