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