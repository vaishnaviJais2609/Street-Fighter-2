const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

class Fighter {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 150;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.draw();
    }
}

const player1 = new Fighter(200, canvas.height - 150, 'red');
const player2 = new Fighter(canvas.width - 250, canvas.height - 150, 'blue');


function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    player1.update();
    player2.update();

    requestAnimationFrame(gameLoop);
}

gameLoop();
