export const STAGES = [
    { id: "bg1", name: "SUZAKU CASTLE", src: "assets/bg1.jpeg" },
    { id: "bg2", name: "GRAND MANSION", src: "assets/bg2.jpeg" },
    { id: "bg3", name: "HONDA BATHHOUSE", src: "assets/bg3.jpeg" },
    { id: "bg4", name: "TEMPLE DOJO", src: "assets/bg4.jpg" }
];
export const stageImages = {};
STAGES.forEach(stage => {
    const img = new Image();
    img.src = stage.src;
    stageImages[stage.id] = img;
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
export function drawBackground(ctx, canvas) {
    const stage = STAGES[currentStageIndex];
    const img = stageImages[stage.id];
    if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}