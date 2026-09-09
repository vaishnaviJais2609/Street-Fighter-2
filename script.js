const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const gravity = 0.7;
const FRAME_DELAY = 5;

let sheetImage;
let animations = {};

class Fighter {
    constructor(x, y, color, facing) {
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
        this.isAttacking = false;
        this.attackBox = {
            x: this.x,
            y: this.y,
            width: 100,
            height: 50
        };
        this.frameIndex = 0;
        this.frameTimer = 0;
    }

    draw() {
        if (!sheetImage || Object.keys(animations).length === 0) {
            
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            if (this.isAttacking) {
                ctx.fillStyle = 'green';
                ctx.fillRect(this.attackBox.x, this.attackBox.y, this.attackBox.width, this.attackBox.height);
            }
            return;
        }

    
        let animState = this.state;
        if (!animations[animState]) {
            animState = 'idle';
        }

        const frames = animations[animState];
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
                    sheetImage,
                    rect.x, rect.y, rect.w, rect.h,
                    0, 0, destWidth, destHeight
                );
            } else {
                ctx.drawImage(
                    sheetImage,
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

const player1 = new Fighter(200, 0, 'red', 1);
const player2 = new Fighter(canvas.width - 250, 0, 'blue', -1);

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    try {
        sheetImage = new Image();
        sheetImage.src = 'character-sprites.png';
        
        const response = await fetch('character-atlas.json');
        if (response.ok) {
            const atlas = await response.json();
            animations = buildAnimations(atlas);
            animations['walk'] = animations['idle'];
        } else {
            console.warn('Could not load assets/character-atlas.json. Place the assets in the assets/ folder.');
        }
    } catch (e) {
        console.warn('Error loading assets:', e);
    }

    if (typeof decreaseTimer === 'function') {
        decreaseTimer(player1, player2);
    }
    
    gameLoop();
}

init();
