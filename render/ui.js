export function drawUI(ctx, canvas, character1, character2, timer, player1Wins, player2Wins, result) {
    ctx.fillStyle = "red";
    ctx.fillRect(50, 40, 300, 25);

    ctx.fillStyle = "blue";
    ctx.fillRect(50, 40, 300 * (character1.health / 100), 25);

    ctx.fillStyle = "red";
    ctx.fillRect(canvas.width - 350, 40, 300, 25);

    ctx.fillStyle = "blue";
    ctx.fillRect(canvas.width - 350, 40, 300 * (character2.health / 100), 25);

    ctx.fillStyle = "white";
    ctx.font = "18px Arial";

    ctx.fillText("PLAYER 1", 50, 30);
    ctx.fillText("PLAYER 2", canvas.width - 140, 30);

    ctx.font = "32px Arial";
    ctx.textAlign = "center";

    ctx.fillText(timer, canvas.width / 2, 60);

    const pipSize = 12;
    const pipGap = 8;
    const startX1 = 130;
    const startX2 = canvas.width - 130;

    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < player1Wins ? "yellow" : "gray";
        ctx.fillRect(startX1 + i * (pipSize + pipGap), 85, pipSize, pipSize);

        ctx.fillStyle = i < player2Wins ? "yellow" : "gray";
        ctx.fillRect(startX2 - i * (pipSize + pipGap), 85, pipSize, pipSize);
    }

    if (result) {
        ctx.fillStyle = "yellow";
        ctx.font = "40px Arial";
        ctx.fillText(result, canvas.width / 2, canvas.height / 2);
    }

    ctx.textAlign = "left";
}