function detectCollision(player1, player2) {
    return (
        player1.attackBox.x + player1.attackBox.width >= player2.x &&
        player1.attackBox.x <= player2.x + player2.width &&
        player1.attackBox.y + player1.attackBox.height >= player2.y &&
        player1.attackBox.y <= player2.y + player2.height
    );
}
function detectProjectileCollision(projectile, player) {
    return (
        projectile.x + projectile.width >= player.x &&
        projectile.x <= player.x + player.width &&
        projectile.y + projectile.height >= player.y &&
        projectile.y <= player.y + player.height
    );
}
function checkBodyCollision(p1, p2, canvasWidth) {
    if (p1.x < p2.x + p2.width && p1.x + p1.width > p2.x &&
        p1.y < p2.y + p2.height && p1.y + p1.height > p2.y) {
        let overlapX = Math.min(p1.x + p1.width - p2.x, p2.x + p2.width - p1.x);
        let shift = overlapX / 2;
        if (p1.x < p2.x) {
            p1.x -= shift;
            p2.x += shift;
        } else {
            p1.x += shift;
            p2.x -= shift;
        }
        if (p1.x < 0) { p2.x += (0 - p1.x); p1.x = 0; }
        if (p2.x < 0) { p1.x += (0 - p2.x); p2.x = 0; }
        if (p1.x > canvasWidth - p1.width) { p2.x -= (p1.x - (canvasWidth - p1.width)); p1.x = canvasWidth - p1.width; }
        if (p2.x > canvasWidth - p2.width) { p1.x -= (p2.x - (canvasWidth - p2.width)); p2.x = canvasWidth - p2.width; }
    }
}