import { drawUI, drawMainMenu, drawBackgroundSelect, getMenuButtonBounds, getStageSelectCardBounds } from "./render/ui.js";
import { drawBackground, STAGES, getCurrentStageIndex, setStageIndex } from "./render/stage.js";
import { getCurrentScene, goTo, MENU_ITEMS, getSelectedIndex, setSelectedIndex, moveSelection } from "./render/menu.js";
import { updateSFX, playRoundStart, playWin, playMenuMove, playMenuSelect } from "./render/sfx.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const character1 = {
    health: 100,
    state: "idle"
};
const character2 = {
    health: 100,
    state: "idle"
};
let player1Wins = 0;
let player2Wins = 0;
let result = null;
let testTimer = 99;

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scene = getCurrentScene();

    if (scene === "menu") {
        drawMainMenu(ctx, canvas, getSelectedIndex());
    } else if (scene === "background-select") {
        drawBackgroundSelect(ctx, canvas, getCurrentStageIndex());
    } else if (scene === "character-select") {
        drawCharacterSelect();
    } else if (scene === "fight") {
        drawBackground(ctx, canvas);
        updateSFX(character1, character2);
        drawUI(ctx, canvas, character1, character2, testTimer, player1Wins, player2Wins, result);
    } else if (scene === "results") {
        drawResults();
    }

    requestAnimationFrame(gameLoop);
}

function executeMenuOption(index) {
    const item = MENU_ITEMS[index];
    playMenuSelect();

    if (item.id === "start") {
        character1.health = 100;
        character2.health = 100;
        result = null;
        playRoundStart();
        goTo("fight");
    } else if (item.id === "character-select") {
        goTo("character-select");
    } else if (item.id === "background-select") {
        goTo("background-select");
    }
}

function drawCharacterSelect() {
    drawBackground(ctx, canvas);

    ctx.fillStyle = "rgba(4, 8, 24, 0.88)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.fillStyle = "#FFDE00";
    ctx.shadowColor = "#FF5500";
    ctx.shadowBlur = 15;
    ctx.textAlign = "center";
    ctx.font = "bold 28px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText("CHARACTER SELECT", canvas.width / 2, canvas.height * 0.25);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.font = "14px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText("RYU  vs  KEN", canvas.width / 2, canvas.height * 0.48);

    ctx.fillStyle = "#FFDE00";
    ctx.font = "12px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText("PRESS ENTER TO FIGHT", canvas.width / 2, canvas.height * 0.65);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "10px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText("PRESS ESC TO RETURN TO MENU", canvas.width / 2, canvas.height - 30);
    ctx.restore();
}

function drawResults() {
    ctx.fillStyle = "#0c1024";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.fillStyle = "#FFDE00";
    ctx.shadowColor = "#FF3300";
    ctx.shadowBlur = 20;
    ctx.textAlign = "center";
    ctx.font = "bold 36px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText(result || "K.O. - RESULTS", canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "14px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText("PRESS ENTER TO REMATCH", canvas.width / 2, canvas.height / 2 + 50);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "10px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText("PRESS ESC FOR MAIN MENU", canvas.width / 2, canvas.height - 30);
    ctx.restore();
}

window.addEventListener("keydown", function(event) {
    const scene = getCurrentScene();

    if (scene === "menu") {
        if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
            moveSelection(-1);
            playMenuMove();
        } else if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
            moveSelection(1);
            playMenuMove();
        } else if (event.key === "Enter" || event.key === " ") {
            executeMenuOption(getSelectedIndex());
        }
    } else if (scene === "background-select") {
        if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
            setStageIndex((getCurrentStageIndex() - 1 + STAGES.length) % STAGES.length);
            playMenuMove();
        } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
            setStageIndex((getCurrentStageIndex() + 1) % STAGES.length);
            playMenuMove();
        } else if (event.key === "Enter" || event.key === " ") {
            playMenuSelect();
            goTo("menu");
        } else if (event.key === "Escape") {
            playMenuMove();
            goTo("menu");
        }
    } else if (scene === "character-select") {
        if (event.key === "Enter" || event.key === " ") {
            character1.health = 100;
            character2.health = 100;
            result = null;
            playRoundStart();
            goTo("fight");
        } else if (event.key === "Escape") {
            goTo("menu");
        }
    } else if (scene === "fight") {
        if (event.key === "Escape") {
            goTo("menu");
        }
    } else if (scene === "results") {
        if (event.key === "Enter" || event.key === " ") {
            character1.health = 100;
            character2.health = 100;
            result = null;
            playRoundStart();
            goTo("fight");
        } else if (event.key === "Escape") {
            goTo("menu");
        }
    }
});

function getCanvasMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}

canvas.addEventListener("mousemove", function(e) {
    const scene = getCurrentScene();
    const pos = getCanvasMousePos(e);

    if (scene === "menu") {
        const buttons = getMenuButtonBounds(canvas);
        let hoveredIndex = -1;

        for (const btn of buttons) {
            if (pos.x >= btn.x && pos.x <= btn.x + btn.width &&
                pos.y >= btn.y && pos.y <= btn.y + btn.height) {
                hoveredIndex = btn.index;
                break;
            }
        }

        if (hoveredIndex !== -1) {
            canvas.style.cursor = "pointer";
            if (hoveredIndex !== getSelectedIndex()) {
                setSelectedIndex(hoveredIndex);
                playMenuMove();
            }
        } else {
            canvas.style.cursor = "default";
        }
    } else if (scene === "background-select") {
        const cards = getStageSelectCardBounds(canvas);
        let hoveredIndex = -1;

        for (const card of cards) {
            if (pos.x >= card.x && pos.x <= card.x + card.width &&
                pos.y >= card.y && pos.y <= card.y + card.height) {
                hoveredIndex = card.index;
                break;
            }
        }

        if (hoveredIndex !== -1) {
            canvas.style.cursor = "pointer";
            if (hoveredIndex !== getCurrentStageIndex()) {
                setStageIndex(hoveredIndex);
                playMenuMove();
            }
        } else {
            canvas.style.cursor = "default";
        }
    } else {
        canvas.style.cursor = "default";
    }
});

canvas.addEventListener("click", function(e) {
    const scene = getCurrentScene();
    const pos = getCanvasMousePos(e);

    if (scene === "menu") {
        const buttons = getMenuButtonBounds(canvas);
        for (const btn of buttons) {
            if (pos.x >= btn.x && pos.x <= btn.x + btn.width &&
                pos.y >= btn.y && pos.y <= btn.y + btn.height) {
                setSelectedIndex(btn.index);
                executeMenuOption(btn.index);
                break;
            }
        }
    } else if (scene === "background-select") {
        const cards = getStageSelectCardBounds(canvas);
        for (const card of cards) {
            if (pos.x >= card.x && pos.x <= card.x + card.width &&
                pos.y >= card.y && pos.y <= card.y + card.height) {
                setStageIndex(card.index);
                playMenuSelect();
                goTo("menu");
                break;
            }
        }
    }
});

gameLoop();