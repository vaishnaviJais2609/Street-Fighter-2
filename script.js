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
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.draw();
        
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


    player1.update();
    player2.update();

    requestAnimationFrame(gameLoop);
}

gameLoop();
