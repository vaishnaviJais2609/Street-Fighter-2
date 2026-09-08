function detectCollision(rect1, rect2) {
    return (
        rect1.attackBox.x < rect2.x + rect2.width &&
        rect1.attackBox.x + rect1.attackBox.width > rect2.x &&
        rect1.attackBox.y < rect2.y + rect2.height &&
        rect1.attackBox.y + rect1.attackBox.height > rect2.y
    );
}
