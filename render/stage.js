const background = new Image();

background.src = "assets/bg1.jpeg";

export function drawBackground(ctx, canvas) {
    if (background.complete && background.naturalWidth>0) {
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    }
}