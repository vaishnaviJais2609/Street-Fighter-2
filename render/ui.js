import { STAGES, getStageImage, getCurrentStageIndex, setStageIndex } from "./stage.js";
import { MENU_ITEMS, getSelectedIndex } from "./menu.js";

export const CHARACTERS = [
    { id: "ryu", name: "RYU", fighterName: "JAPAN", src: "assets/ryu.jpg" },
    { id: "master", name: "KEN MASTERS", fighterName: "USA", src: "assets/master.jpg" }
];

export const characterImages = {};
CHARACTERS.forEach(c => {
    const img = new Image();
    img.src = c.src;
    characterImages[c.id] = img;
});

let selectedCharacterIndex = 0;

export function getSelectedCharacterIndex() {
    return selectedCharacterIndex;
}

export function setSelectedCharacterIndex(idx) {
    if (idx >= 0 && idx < CHARACTERS.length) {
        selectedCharacterIndex = idx;
    }
}

export function getSelectedCharacter() {
    return CHARACTERS[selectedCharacterIndex];
}

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

export function drawMainMenu(ctx, canvas, activeIndex = getSelectedIndex(), hoveredIndex = -1) {
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
        const isHovered = btn.index === hoveredIndex;
        const isHighlighted = isSelected || isHovered;

        const yellowColor = isHovered ? "#B8960C" : "#FFDE00";
        const glowColor = isHovered ? "rgba(184, 150, 12, 0.4)" : "rgba(255, 222, 0, 0.8)";

        ctx.save();

        const btnGradient = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.height);
        if (isHighlighted) {
            btnGradient.addColorStop(0, "#103982");
            btnGradient.addColorStop(1, "#071e4d");
        } else {
            btnGradient.addColorStop(0, "#0c285e");
            btnGradient.addColorStop(1, "#051330");
        }

        ctx.fillStyle = btnGradient;
        drawRoundedRect(ctx, btn.x, btn.y, btn.width, btn.height, 8);
        ctx.fill();

        if (isHighlighted) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = isHovered ? 8 : 14;
            ctx.strokeStyle = yellowColor;
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

        if (isHighlighted) {
            const arrowX = btn.x + 22 + arrowBob;
            const arrowY = btn.y + btn.height / 2;
            const arrowSize = 10;

            ctx.fillStyle = yellowColor;
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY - arrowSize);
            ctx.lineTo(arrowX + arrowSize * 1.2, arrowY);
            ctx.lineTo(arrowX, arrowY + arrowSize);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = yellowColor;
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
    const totalStages = STAGES.length;
    const cardWidth = Math.min(230, (canvas.width - (totalStages + 1) * 20) / totalStages);
    const cardHeight = cardWidth * 0.72 + 65;
    const gap = 18;
    const totalWidth = totalStages * cardWidth + (totalStages - 1) * gap;
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

export function drawBackgroundSelect(ctx, canvas, activeIndex = getCurrentStageIndex(), hoveredIndex = -1) {
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
        const isHovered = card.index === hoveredIndex;
        const isHighlighted = isSelected || isHovered;

        const yellowColor = isHovered ? "#B8960C" : "#FFDE00";
        const glowColor = isHovered ? "rgba(184, 150, 12, 0.4)" : "rgba(255, 222, 0, 0.8)";
        const img = getStageImage(card.id);

        ctx.save();

        ctx.fillStyle = isHighlighted ? "#0f2c66" : "#081636";
        drawRoundedRect(ctx, card.x, card.y, card.width, card.height, 8);
        ctx.fill();

        if (isHighlighted) {
            ctx.strokeStyle = yellowColor;
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = isHovered ? 8 : 16;
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
        ctx.font = "bold 10px 'Press Start 2P', monospace, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isHighlighted ? yellowColor : "#FFFFFF";
        ctx.fillText(card.name, card.x + card.width / 2, card.y + thumbH + 36);
        ctx.restore();
    });

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "11px 'Press Start 2P', monospace, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("[← / →] Choose Stage   •   [ENTER] Confirm   •   [ESC] Back", canvas.width / 2, canvas.height - 40);
    ctx.restore();
}

export function getCharacterSelectCardBounds(canvas) {
    const cardWidth = Math.min(280, canvas.width * 0.36);
    const cardHeight = Math.min(420, canvas.height * 0.62);
    const gap = 36;
    const totalWidth = CHARACTERS.length * cardWidth + (CHARACTERS.length - 1) * gap;
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - cardHeight) / 2 + 25;

    return CHARACTERS.map((char, index) => ({
        index,
        id: char.id,
        name: char.name,
        fighterName: char.fighterName,
        src: char.src,
        x: startX + index * (cardWidth + gap),
        y: startY,
        width: cardWidth,
        height: cardHeight
    }));
}

export function drawCharacterSelect(ctx, canvas, activeIndex = getSelectedCharacterIndex(), hoveredIndex = -1) {
    const currentImg = getStageImage(STAGES[getCurrentStageIndex()].id);
    if (currentImg && currentImg.complete) {
        ctx.drawImage(currentImg, 0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = "rgba(4, 8, 24, 0.88)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.font = "bold 28px 'Press Start 2P', monospace, sans-serif";
    ctx.fillStyle = "#FFDE00";
    ctx.shadowColor = "#FF5500";
    ctx.shadowBlur = 15;
    ctx.textAlign = "center";
    ctx.fillText("CHARACTER SELECT", canvas.width / 2, canvas.height * 0.14);
    ctx.restore();

    const time = Date.now();
    const arrowBob = Math.sin(time / 160) * 3;

    const cards = getCharacterSelectCardBounds(canvas);
    cards.forEach(card => {
        const isSelected = card.index === activeIndex;
        const isHovered = card.index === hoveredIndex;
        const isHighlighted = isSelected || isHovered;

        const yellowColor = isHovered ? "#B8960C" : "#FFDE00";
        const glowColor = isHovered ? "rgba(184, 150, 12, 0.4)" : "rgba(255, 222, 0, 0.8)";
        const img = characterImages[card.id];

        ctx.save();
        ctx.fillStyle = isHighlighted ? "#0e2c66" : "#081636";
        drawRoundedRect(ctx, card.x, card.y, card.width, card.height, 10);
        ctx.fill();

        if (isHighlighted) {
            ctx.strokeStyle = yellowColor;
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = isHovered ? 8 : 16;
            ctx.lineWidth = 4;
        } else {
            ctx.strokeStyle = "#1e488f";
            ctx.lineWidth = 2;
        }
        ctx.stroke();
        ctx.restore();

        const imgPad = 12;
        const imgX = card.x + imgPad;
        const imgY = card.y + imgPad;
        const imgW = card.width - imgPad * 2;
        const imgH = card.height - 85;

        ctx.save();
        ctx.fillStyle = "#FFFFFF";
        drawRoundedRect(ctx, imgX, imgY, imgW, imgH, 6);
        ctx.fill();

        ctx.strokeStyle = isHighlighted ? "rgba(255, 222, 0, 0.4)" : "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        if (img && img.complete && img.naturalWidth > 0) {
            ctx.save();
            drawRoundedRect(ctx, imgX, imgY, imgW, imgH, 6);
            ctx.clip();

            const scale = Math.min((imgW - 14) / img.naturalWidth, (imgH - 14) / img.naturalHeight);
            const drawW = img.naturalWidth * scale;
            const drawH = img.naturalHeight * scale;
            const drawX = imgX + (imgW - drawW) / 2;
            const drawY = imgY + (imgH - drawH) / 2;

            ctx.drawImage(img, drawX, drawY, drawW, drawH);
            ctx.restore();
        }

        ctx.save();
        ctx.font = "bold 13px 'Press Start 2P', monospace, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isHighlighted ? yellowColor : "#FFFFFF";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(card.name, card.x + card.width / 2, card.y + card.height - 52);

        ctx.font = "bold 11px 'Press Start 2P', monospace, sans-serif";
        ctx.fillStyle = isHighlighted ? "#FFFFFF" : "#8899aa";
        ctx.fillText(card.fighterName, card.x + card.width / 2, card.y + card.height - 24);
        ctx.restore();

        if (isHighlighted) {
            ctx.save();
            const arrowX = card.x + card.width / 2;
            const arrowY = card.y - 14 + arrowBob;
            const arrowSize = 9;

            ctx.fillStyle = yellowColor;
            ctx.beginPath();
            ctx.moveTo(arrowX - arrowSize, arrowY - arrowSize);
            ctx.lineTo(arrowX + arrowSize, arrowY - arrowSize);
            ctx.lineTo(arrowX, arrowY + arrowSize * 0.8);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    });

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "11px 'Press Start 2P', monospace, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("[← / →] Choose Fighter   •   [ENTER] Fight   •   [ESC] Back", canvas.width / 2, canvas.height - 35);
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

    const p1Char = CHARACTERS[selectedCharacterIndex] || CHARACTERS[0];
    const p2Char = CHARACTERS.find((_, i) => i !== selectedCharacterIndex) || CHARACTERS[1] || CHARACTERS[0];

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 14px 'Press Start 2P', monospace, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(p1Char.name, p1X, barY - 12);

    ctx.textAlign = "right";
    ctx.fillText(p2Char.name, p2X + barWidth, barY - 12);

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