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
                            projectiles.push(new Projectile({
                                x: this.facing === 1 ? this.x + this.width : this.x - 50,
                                y: this.y + 20,
                                velocity: { x: this.facing === 1 ? 10 : -10, y: 0 },
                                image: this.image,
                                animations: this.animations,
                                facing: this.facing,
                                owner: this
                            }));
                            projectiles[projectiles.length - 1].extraImages = this.extraImages;
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
        this.y += this.velocityY;
        if (this.y + this.height + this.velocityY >= canvas.height) {
            this.velocityY = 0;
            this.y = canvas.height - this.height;
        } else {
            this.velocityY += gravity;
        }
    }
}