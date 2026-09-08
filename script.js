import { drawUI } from "./render/ui.js";
import {drawBackground} from "./render/stage.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const character1 = {
    health: 100
};
const character2 = {
    health: 100
};
let player1Wins = 0;
let player2Wins = 0;
let result = null;
let testTimer = 99;

function gameLoop() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawBackground(ctx, canvas);
    drawUI(
        ctx,
        canvas,
        character1,
        character2,
        testTimer,
        player1Wins,
        player2Wins,
        result
    );
     requestAnimationFrame(gameLoop);
}
gameLoop();