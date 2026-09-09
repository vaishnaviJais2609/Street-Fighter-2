function updateState(fighter) {
    if (fighter.velocityY < 0) {
        fighter.state = 'jump';
    } else if (fighter.velocityY > 0) {
        fighter.state = 'fall';
    } else if (fighter.velocityX !== 0) {
        fighter.state = 'walk';
    } else {
        fighter.state = 'idle';
    }
}
