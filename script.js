import { drawUI } from "./render/ui.js";
import {drawBackground} from "./render/stage.js";
import {getCurrentScene, goTo} from "./render/menu.js";

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
    const scene = getCurrentScene();

    if (scene === "menu") {
        drawMenu();
    } else if (scene === "character-select") {
        drawCharacterSelect();
    } else if (scene === "fight") {
        drawBackground(ctx, canvas);
        drawUI(ctx, canvas, character1, character2, testTimer, player1Wins, player2Wins, result);
    } else if (scene === "results") {
        drawResults();
    }

    requestAnimationFrame(gameLoop);
}

function drawMenu() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "50px Arial";
    ctx.fillText("STREET FIGHTER 2", canvas.width / 2, canvas.height / 3);
    ctx.font = "25px Arial";
    ctx.fillText("Press ENTER to Start", canvas.width / 2, canvas.height / 2);
    ctx.textAlign = "left";
}

function drawCharacterSelect() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "40px Arial";
    ctx.fillText("SELECT CHARACTER", canvas.width / 2, canvas.height / 3);
    ctx.font = "24px Arial";
    ctx.fillText("Press ENTER to Fight", canvas.width / 2, canvas.height / 2);
    ctx.textAlign = "left";
}
gameLoop();