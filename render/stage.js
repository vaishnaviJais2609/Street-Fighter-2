export const STAGES = [
    { id: "bg1", name: "SUZAKU CASTLE", src: "assets/bg1.jpeg", floorRatio: 0.85 },
    { id: "bg2", name: "GRAND MANSION", src: "assets/bg2.jpeg", floorRatio: 0.95 },
    { id: "bg3", name: "HONDA BATHHOUSE", src: "assets/bg3.jpeg", floorRatio: 0.90 },
    { id: "bg4", name: "TEMPLE DOJO", src: "assets/bg4.jpg", floorRatio: 0.95 }
];

export const ROUND_BANNERS = {
    1: "assets/battle1.png",
    2: "assets/battle2.png",
    3: "assets/battle3.png"
};

export const stageImages = {};
STAGES.forEach(stage => {
    const img = new Image();
    img.src = stage.src;
    stageImages[stage.id] = img;
});

export const bannerImages = {};
Object.keys(ROUND_BANNERS).forEach(round => {
    const img = new Image();
    img.src = ROUND_BANNERS[round];
    bannerImages[round] = img;
});

let currentStageIndex = 0;
export function setStageIndex(idx) {
    if (idx >= 0 && idx < STAGES.length) {
        currentStageIndex = idx;
    }
}
export function getCurrentStageIndex() {
    return currentStageIndex;
}
export function getCurrentStage() {
    return STAGES[currentStageIndex];
}
export function getStageImage(id) {
    return stageImages[id];
}
export function getFloorY(canvas) {
    const stage = STAGES[currentStageIndex];
    return canvas.height * (stage.floorRatio || 0.85);
}

export function drawBackground(ctx, canvas) {
    const stage = STAGES[currentStageIndex];
    const img = stageImages[stage.id];
    if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

export function drawRoundBanner(ctx, canvas, roundNumber) {
    const img = bannerImages[roundNumber];
    if (img && img.complete && img.naturalWidth > 0) {
        const scale = 0.35;
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;
        ctx.drawImage(img, x, y, w, h);
    }
}