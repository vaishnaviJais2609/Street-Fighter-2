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
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
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
    w: { pressed: false }
};

window.addEventListener('keydown', (event) => {
    if (keys[event.key]) {
        keys[event.key].pressed = true;
    }
});

window.addEventListener('keyup', (event) => {
    if (keys[event.key]) {
        keys[event.key].pressed = false;
    }
});

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

    requestAnimationFrame(gameLoop);
}

gameLoop();
