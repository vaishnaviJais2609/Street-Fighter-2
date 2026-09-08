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

        if (this.velocityY < 0) {
            this.state = 'jump';
        } else if (this.velocityY > 0) {
            this.state = 'fall';
        } else if (this.velocityX !== 0) {
            this.state = 'walk';
        } else {
            this.state = 'idle';
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
    if (event.key === ' ') {
        player1.attack();
    }
});

window.addEventListener('keyup', (event) => {
    if (keys[event.key]) {
        keys[event.key].pressed = false;
    }
});

function detectCollision(rect1, rect2) {
    return (
        rect1.attackBox.x < rect2.x + rect2.width &&
        rect1.attackBox.x + rect1.attackBox.width > rect2.x &&
        rect1.attackBox.y < rect2.y + rect2.height &&
        rect1.attackBox.y + rect1.attackBox.height > rect2.y
    );
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player1.velocityX = 0;
    if (keys.a.pressed) player1.velocityX = -player1.speed;
    else if (keys.d.pressed) player1.velocityX = player1.speed;

    if (keys.w.pressed && player1.y + player1.height >= canvas.height) {
        player1.velocityY = -15;
    }

    player2.velocityX = 0;
    
    let distance = player1.x - player2.x;
    if (Math.abs(distance) > 50) {
        if (distance > 0) {
            player2.velocityX = player2.speed - 1;
        } else {
            player2.velocityX = -(player2.speed - 1);
        }
    }

    player1.update();
    player2.update();

    if (player1.isAttacking && detectCollision(player1, player2)) {
        player1.isAttacking = false;
        player2.color = 'white';
        setTimeout(() => {
            player2.color = 'blue';
        }, 100);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
