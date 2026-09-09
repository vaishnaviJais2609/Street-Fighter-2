import { STAGES, getStageImage, getCurrentStageIndex, setStageIndex } from "./stage.js";
import { MENU_ITEMS, getSelectedIndex } from "./menu.js";

const menuBg = new Image();
menuBg.src = "assets/bg1.jpeg";

const logoImg = new Image();
logoImg.src = "assets/street-fighter logo.png";

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

export function getMenuButtonBounds(canvas) {
    const btnWidth = Math.min(canvas.width * 0.7, 440);
    const btnHeight = 56;
    const btnGap = 16;
    const totalHeight = MENU_ITEMS.length * btnHeight + (MENU_ITEMS.length - 1) * btnGap;

    const startY = Math.max(canvas.height * 0.52, (canvas.height - totalHeight) / 2 + 80);
    const startX = (canvas.width - btnWidth) / 2;

    return MENU_ITEMS.map((item, index) => ({
        index,
        id: item.id,
        label: item.label,
        x: startX,
        y: startY + index * (btnHeight + btnGap),
        width: btnWidth,
        height: btnHeight
    }));
}

export function drawMainMenu(ctx, canvas, activeIndex = getSelectedIndex()) {
    if (menuBg.complete && menuBg.naturalWidth > 0) {
        ctx.drawImage(menuBg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#050b1a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const bgGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.45, 100,
        canvas.width / 2, canvas.height * 0.45, Math.max(canvas.width, canvas.height) * 0.75
    );
    bgGradient.addColorStop(0, "rgba(5, 12, 35, 0.45)");
    bgGradient.addColorStop(1, "rgba(2, 6, 18, 0.85)");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const buttons = getMenuButtonBounds(canvas);
    const topMargin = Math.max(25, canvas.height * 0.05);
    const availableLogoHeight = buttons[0].y - topMargin - 20;

    const maxLogoWidth = Math.min(canvas.width * 0.65, 480);
    const logoAspect = 900 / 435;
    let logoWidth = maxLogoWidth;
    let logoHeight = logoWidth / logoAspect;

    if (logoHeight > availableLogoHeight) {
        logoHeight = Math.max(availableLogoHeight, 80);
        logoWidth = logoHeight * logoAspect;
    }

    const logoX = (canvas.width - logoWidth) / 2;
    const logoY = topMargin + (availableLogoHeight - logoHeight) / 2;

    if (logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.save();
        const pulse = Math.sin(Date.now() / 400) * 4;
        ctx.shadowColor = "rgba(255, 180, 0, 0.5)";
        ctx.shadowBlur = 16 + pulse;
        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
        ctx.restore();
    } else {
        ctx.fillStyle = "#FFDE00";
        ctx.font = "bold 32px 'Press Start 2P', monospace, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("STREET FIGHTER II", canvas.width / 2, topMargin + 70);
    }

    const time = Date.now();
    const arrowBob = Math.sin(time / 160) * 3;

    buttons.forEach((btn) => {
        const isSelected = btn.index === activeIndex;

        ctx.save();

        const btnGradient = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.height);
        if (isSelected) {
            btnGradient.addColorStop(0, "#103982");
            btnGradient.addColorStop(1, "#071e4d");
        } else {
            btnGradient.addColorStop(0, "#0c285e");
            btnGradient.addColorStop(1, "#051330");
        }

        ctx.fillStyle = btnGradient;
        drawRoundedRect(ctx, btn.x, btn.y, btn.width, btn.height, 8);
        ctx.fill();

        if (isSelected) {
            ctx.shadowColor = "#FFDE00";
            ctx.shadowBlur = 14;
            ctx.strokeStyle = "#FFDE00";
            ctx.lineWidth = 3.5;
        } else {
            ctx.strokeStyle = "#1e4c9c";
            ctx.lineWidth = 2;
        }
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.font = "bold 16px 'Press Start 2P', monospace, sans-serif";
        ctx.textBaseline = "middle";

        if (isSelected) {
            const arrowX = btn.x + 22 + arrowBob;
            const arrowY = btn.y + btn.height / 2;
            const arrowSize = 10;

            ctx.fillStyle = "#FFDE00";
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY - arrowSize);
            ctx.lineTo(arrowX + arrowSize * 1.2, arrowY);
            ctx.lineTo(arrowX, arrowY + arrowSize);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#FFDE00";
            ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        } else {
            ctx.fillStyle = "#FFFFFF";
            ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }

        ctx.textAlign = "center";
        ctx.fillText(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2);
        ctx.restore();
    });

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "10px 'Press Start 2P', monospace, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("USE ↑ / ↓ OR MOUSE TO SELECT • PRESS ENTER", canvas.width / 2, canvas.height - 24);
    ctx.restore();
}

export function getStageSelectCardBounds(canvas) {
    const cardWidth = Math.min(260, canvas.width * 0.28);
    const cardHeight = cardWidth * 0.75 + 70;
    const gap = 24;
    const totalWidth = STAGES.length * cardWidth + (STAGES.length - 1) * gap;
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - cardHeight) / 2 + 20;

    return STAGES.map((stage, index) => ({
        index,
        id: stage.id,
        name: stage.name,
        src: stage.src,
        x: startX + index * (cardWidth + gap),
        y: startY,
        width: cardWidth,
        height: cardHeight
    }));
}

export function drawBackgroundSelect(ctx, canvas, activeIndex = getCurrentStageIndex()) {
    const currentImg = getStageImage(STAGES[activeIndex].id);
    if (currentImg && currentImg.complete) {
        ctx.drawImage(currentImg, 0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = "rgba(5, 10, 25, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.font = "bold 28px 'Press Start 2P', monospace, sans-serif";
    ctx.fillStyle = "#FFDE00";
    ctx.shadowColor = "#FF8800";
    ctx.shadowBlur = 12;
    ctx.textAlign = "center";
    ctx.fillText("SELECT STAGE", canvas.width / 2, canvas.height * 0.16);
    ctx.restore();

    const cards = getStageSelectCardBounds(canvas);
    cards.forEach(card => {
        const isSelected = card.index === activeIndex;
        const img = getStageImage(card.id);

        ctx.save();

        ctx.fillStyle = isSelected ? "#0f2c66" : "#081636";
        drawRoundedRect(ctx, card.x, card.y, card.width, card.height, 8);
        ctx.fill();

        if (isSelected) {
            ctx.strokeStyle = "#FFDE00";
            ctx.shadowColor = "#FFDE00";
            ctx.shadowBlur = 16;
            ctx.lineWidth = 4;
        } else {
            ctx.strokeStyle = "#1d4484";
            ctx.lineWidth = 2;
        }
        ctx.stroke();
        ctx.restore();

        const thumbX = card.x + 8;
        const thumbY = card.y + 8;
        const thumbW = card.width - 16;
        const thumbH = card.width * 0.72;

        if (img && img.complete) {
            ctx.save();
            drawRoundedRect(ctx, thumbX, thumbY, thumbW, thumbH, 4);
            ctx.clip();
            ctx.drawImage(img, thumbX, thumbY, thumbW, thumbH);
            ctx.restore();
        }

        ctx.save();
        ctx.font = "bold 11px 'Press Start 2P', monospace, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isSelected ? "#FFDE00" : "#FFFFFF";
        ctx.fillText(card.name, card.x + card.width / 2, card.y + thumbH + 40);
        ctx.restore();
    });

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "11px 'Press Start 2P', monospace, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("[← / →] Choose Stage   •   [ENTER] Confirm   •   [ESC] Back", canvas.width / 2, canvas.height - 40);
    ctx.restore();
}

export function drawUI(ctx, canvas, character1, character2, timer, player1Wins, player2Wins, result) {
    const barWidth = Math.min(canvas.width * 0.35, 340);
    const barHeight = 24;
    const barY = 40;
    const p1X = 50;
    const p2X = canvas.width - barWidth - 50;

    ctx.fillStyle = "#8B0000";
    ctx.fillRect(p1X, barY, barWidth, barHeight);
    ctx.fillRect(p2X, barY, barWidth, barHeight);

    const p1HealthPercent = Math.max(0, Math.min(100, character1.health)) / 100;
    const p2HealthPercent = Math.max(0, Math.min(100, character2.health)) / 100;

    ctx.fillStyle = "#FFDE00";
    ctx.fillRect(p1X, barY, barWidth * p1HealthPercent, barHeight);
    ctx.fillRect(p2X + barWidth * (1 - p2HealthPercent), barY, barWidth * p2HealthPercent, barHeight);

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(p1X, barY, barWidth, barHeight);
    ctx.strokeRect(p2X, barY, barWidth, barHeight);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 14px 'Press Start 2P', monospace, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("PLAYER 1", p1X, barY - 12);

    ctx.textAlign = "right";
    ctx.fillText("PLAYER 2", p2X + barWidth, barY - 12);

    ctx.save();
    ctx.font = "bold 34px 'Press Start 2P', monospace, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = timer <= 10 ? "#FF2222" : "#FFDE00";
    ctx.shadowColor = "#000000";
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillText(timer, canvas.width / 2, barY + 28);
    ctx.restore();

    const pipSize = 12;
    const pipGap = 8;
    const p1PipStartX = p1X;
    const p2PipStartX = p2X + barWidth - pipSize;

    for (let i = 0; i < 2; i++) {
        ctx.fillStyle = i < player1Wins ? "#FFDE00" : "#444444";
        ctx.fillRect(p1PipStartX + i * (pipSize + pipGap), barY + barHeight + 10, pipSize, pipSize);
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1;
        ctx.strokeRect(p1PipStartX + i * (pipSize + pipGap), barY + barHeight + 10, pipSize, pipSize);

        ctx.fillStyle = i < player2Wins ? "#FFDE00" : "#444444";
        ctx.fillRect(p2PipStartX - i * (pipSize + pipGap), barY + barHeight + 10, pipSize, pipSize);
        ctx.strokeRect(p2PipStartX - i * (pipSize + pipGap), barY + barHeight + 10, pipSize, pipSize);
    }

    if (result) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, canvas.height / 2 - 60, canvas.width, 120);

        ctx.fillStyle = "#FFDE00";
        ctx.shadowColor = "#FF3300";
        ctx.shadowBlur = 18;
        ctx.font = "bold 38px 'Press Start 2P', monospace, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(result, canvas.width / 2, canvas.height / 2 + 12);
        ctx.restore();
    }

    ctx.textAlign = "left";
}