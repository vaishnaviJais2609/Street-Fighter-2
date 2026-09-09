import { drawUI, drawMainMenu, drawBackgroundSelect, drawCharacterSelect, drawInstructions, getMenuButtonBounds, getStageSelectCardBounds, getCharacterSelectCardBounds, CHARACTERS, getSelectedCharacterIndex, setSelectedCharacterIndex } from "./render/ui.js";
import { drawBackground, STAGES, getCurrentStageIndex, setStageIndex } from "./render/stage.js";
import { getCurrentScene, goTo, MENU_ITEMS, getSelectedIndex, setSelectedIndex, moveSelection } from "./render/menu.js";
import { updateSFX, playRoundStart, playWin } from "./render/sfx.js";

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

let isMultiplayer = false;
window.isMultiplayer = isMultiplayer;

function setMultiplayer(value) {
    isMultiplayer = value;
    window.isMultiplayer = value;
}

let hoveredMenuIndex = -1;
let hoveredStageIndex = -1;
let hoveredCharIndex = -1;

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scene = getCurrentScene();

    if (scene === "menu") {
        drawMainMenu(ctx, canvas, getSelectedIndex(), hoveredMenuIndex);
    } else if (scene === "background-select") {
        drawBackgroundSelect(ctx, canvas, getCurrentStageIndex(), hoveredStageIndex);
    } else if (scene === "character-select") {
        drawCharacterSelect(ctx, canvas, getSelectedCharacterIndex(), hoveredCharIndex);
    } else if (scene === "fight") {
        drawBackground(ctx, canvas);
        updateSFX(character1, character2);
        drawUI(ctx, canvas, character1, character2, testTimer, player1Wins, player2Wins, result);
    } else if (scene === "results") {
        drawResults();
    } else if (scene === "instructions") {
        drawInstructions(ctx, canvas);
    }

    requestAnimationFrame(gameLoop);
}

function executeMenuOption(index) {
    const item = MENU_ITEMS[index];

    if (item.id === "start") {
        setMultiplayer(false);
        character1.health = 100;
        character2.health = 100;
        result = null;
        playRoundStart();
        goTo("fight");
    } else if (item.id === "multiplayer") {   // ← new branch
        setMultiplayer(true);
        character1.health = 100;
        character2.health = 100;
        result = null;
        playRoundStart();
        goTo("fight");
    }
    else if (item.id === "character-select") {
        goTo("character-select");
    } else if (item.id === "background-select") {
        goTo("background-select");
    }
    else if (item.id === "instructions") {
        goTo("instructions");
    }
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

window.addEventListener("keydown", function (event) {
    const scene = getCurrentScene();

    if (scene === "menu") {
        if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
            moveSelection(-1);
        } else if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
            moveSelection(1);
        } else if (event.key === "Enter" || event.key === " ") {
            executeMenuOption(getSelectedIndex());
        }
    } else if (scene === "background-select") {
        if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
            setStageIndex((getCurrentStageIndex() - 1 + STAGES.length) % STAGES.length);
        } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
            setStageIndex((getCurrentStageIndex() + 1) % STAGES.length);
        } else if (event.key === "Enter" || event.key === " ") {
            goTo("menu");
        } else if (event.key === "Escape") {
            goTo("menu");
        }
    } else if (scene === "character-select") {
        if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
            const nextIdx = (getSelectedCharacterIndex() - 1 + CHARACTERS.length) % CHARACTERS.length;
            setSelectedCharacterIndex(nextIdx);
        } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
            const nextIdx = (getSelectedCharacterIndex() + 1) % CHARACTERS.length;
            setSelectedCharacterIndex(nextIdx);
        } else if (event.key === "Enter" || event.key === " ") {
            setMultiplayer(false);
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
    } else if (scene === "instructions") {
        if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
            goTo("menu");
        }
    }
    else if (scene === "results") {
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

canvas.addEventListener("mousemove", function (e) {
    const scene = getCurrentScene();
    const pos = getCanvasMousePos(e);

    if (scene === "menu") {
        const buttons = getMenuButtonBounds(canvas);
        let foundIndex = -1;

        for (const btn of buttons) {
            if (pos.x >= btn.x && pos.x <= btn.x + btn.width &&
                pos.y >= btn.y && pos.y <= btn.y + btn.height) {
                foundIndex = btn.index;
                break;
            }
        }

        hoveredMenuIndex = foundIndex;

        if (foundIndex !== -1) {
            canvas.style.cursor = "pointer";
            if (foundIndex !== getSelectedIndex()) {
                setSelectedIndex(foundIndex);
            }
        } else {
            canvas.style.cursor = "default";
        }
    } else if (scene === "background-select") {
        const cards = getStageSelectCardBounds(canvas);
        let foundIndex = -1;

        for (const card of cards) {
            if (pos.x >= card.x && pos.x <= card.x + card.width &&
                pos.y >= card.y && pos.y <= card.y + card.height) {
                foundIndex = card.index;
                break;
            }
        }

        hoveredStageIndex = foundIndex;

        if (foundIndex !== -1) {
            canvas.style.cursor = "pointer";
            if (foundIndex !== getCurrentStageIndex()) {
                setStageIndex(foundIndex);
            }
        } else {
            canvas.style.cursor = "default";
        }
    } else if (scene === "character-select") {
        const cards = getCharacterSelectCardBounds(canvas);
        let foundIndex = -1;

        for (const card of cards) {
            if (pos.x >= card.x && pos.x <= card.x + card.width &&
                pos.y >= card.y && pos.y <= card.y + card.height) {
                foundIndex = card.index;
                break;
            }
        }

        hoveredCharIndex = foundIndex;

        if (foundIndex !== -1) {
            canvas.style.cursor = "pointer";
            if (foundIndex !== getSelectedCharacterIndex()) {
                setSelectedCharacterIndex(foundIndex);
            }
        } else {
            canvas.style.cursor = "default";
        }
    } else {
        canvas.style.cursor = "default";
        hoveredMenuIndex = -1;
        hoveredStageIndex = -1;
        hoveredCharIndex = -1;
    }
});

canvas.addEventListener("mouseleave", function () {
    hoveredMenuIndex = -1;
    hoveredStageIndex = -1;
    hoveredCharIndex = -1;
    canvas.style.cursor = "default";
});

canvas.addEventListener("click", function (e) {
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
                goTo("menu");
                break;
            }
        }
    } else if (scene === "character-select") {
        const cards = getCharacterSelectCardBounds(canvas);
        for (const card of cards) {
            if (pos.x >= card.x && pos.x <= card.x + card.width &&
                pos.y >= card.y && pos.y <= card.y + card.height) {
                setSelectedCharacterIndex(card.index);
                setMultiplayer(false);
                playRoundStart();
                character1.health = 100;
                character2.health = 100;
                result = null;
                goTo("fight");
                break;
            }
        }
    }
});

gameLoop();
