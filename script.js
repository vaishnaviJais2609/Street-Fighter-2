const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const gravity = 0.7;

class Fighter {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 150;
        this.color = color;
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
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        if (this.isAttacking) {
            ctx.fillStyle = 'green';
            ctx.fillRect(this.attackBox.x, this.attackBox.y, this.attackBox.width, this.attackBox.height);
        }
    }

    attack() {
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }

    update() {
        this.attackBox.x = this.x;
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

const player1 = new Fighter(200, 0, 'red');
const player2 = new Fighter(canvas.width - 250, 0, 'blue');

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player1.velocityX = 0;
    if (typeof keys !== 'undefined') {
        if (keys.a.pressed) player1.velocityX = -player1.speed;
        else if (keys.d.pressed) player1.velocityX = player1.speed;

        if (keys.w.pressed && player1.y + player1.height >= canvas.height) {
            player1.velocityY = -15;
        }
    }

    if (typeof updateAI === 'function') {
        updateAI(player1, player2);
    }

    player1.update();
    player2.update();

    if (typeof checkHits === 'function') {
        checkHits(player1, player2);
    }

    if (typeof determineWinner === 'function') {
        determineWinner(player1, player2);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
